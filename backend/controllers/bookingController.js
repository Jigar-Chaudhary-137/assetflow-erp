const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    List All Bookings
// @route   GET /api/bookings
// @access  Private (Admin or Asset Manager only)
const getBookings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, resourceId } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }
  if (resourceId) {
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return next(new ApiError('Invalid Resource ID format', 400));
    }
    query.resourceId = resourceId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('resourceId', 'name assetTag status')
    .populate('employeeId', 'name email username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      docs: bookings,
      totalDocs: total,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + bookings.length < total,
      hasPrevPage: skip > 0
    }, 'Bookings retrieved successfully')
  );
});

// @desc    Get Own Bookings
// @route   GET /api/bookings/my
// @access  Private (Any authenticated user)
const getMyBookings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { employeeId: req.user._id };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('resourceId', 'name assetTag status')
    .populate('employeeId', 'name email username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      docs: bookings,
      totalDocs: total,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + bookings.length < total,
      hasPrevPage: skip > 0
    }, 'My bookings retrieved successfully')
  );
});

// @desc    Get Single Booking
// @route   GET /api/bookings/:id
// @access  Private (Any authenticated user)
const getBookingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Booking ID format', 400));
  }

  const booking = await Booking.findById(id)
    .populate('resourceId', 'name assetTag status bookable')
    .populate('employeeId', 'name email username role');

  if (!booking) {
    return next(new ApiError('Booking not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, booking, 'Booking retrieved successfully')
  );
});

// @desc    Create Booking
// @route   POST /api/bookings
// @access  Private (Any authenticated user)
const createBooking = asyncHandler(async (req, res, next) => {
  const { resourceId, startTime, endTime, purpose } = req.body;
  const employeeId = req.user._id;

  // 1. Check if resource (asset) exists and is bookable
  const asset = await Asset.findById(resourceId);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  if (!asset.bookable) {
    return next(new ApiError('Asset is not marked as bookable', 400));
  }

  // Check asset status (cannot book if LOST, RETIRED, DISPOSED, UNDER_MAINTENANCE)
  const blockedStatuses = ['LOST', 'RETIRED', 'DISPOSED', 'UNDER_MAINTENANCE'];
  if (blockedStatuses.includes(asset.status.toUpperCase())) {
    return next(new ApiError(`Asset is not available for booking. Current status: ${asset.status}`, 400));
  }

  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);

  // 2. Overlap validation check
  const overlappingBooking = await Booking.findOne({
    resourceId,
    status: { $in: ['UPCOMING', 'ONGOING'] },
    startTime: { $lt: newEnd },
    endTime: { $gt: newStart }
  });

  if (overlappingBooking) {
    return next(new ApiError('The resource is already booked for this time slot', 409));
  }

  // 3. Create booking
  const booking = await Booking.create({
    resourceId,
    employeeId,
    startTime: newStart,
    endTime: newEnd,
    purpose,
    status: 'UPCOMING'
  });

  // 4. Asset Status Cascade: Set asset status to RESERVED and record in history
  asset.status = 'RESERVED';
  asset.history.push({
    action: 'STATUS_CHANGED',
    performedById: req.user._id,
    details: `Asset reserved for booking from ${newStart.toISOString()} to ${newEnd.toISOString()}`
  });
  await asset.save();

  // Trigger notification
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: employeeId,
      title: 'Booking Created',
      message: `Your booking request for resource ${asset.name} has been confirmed.`,
      type: 'SUCCESS',
      priority: 'MEDIUM',
      module: 'ALLOCATION',
      entityId: booking._id.toString()
    });
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, booking, 'Booking created successfully')
  );
});

// @desc    Cancel Booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Own booking, or Admin / Asset Manager)
const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Booking ID format', 400));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError('Booking not found', 404));
  }

  // Authorization check
  const isOwner = booking.employeeId.toString() === req.user._id.toString();
  const isAdminOrManager = ['ADMIN', 'ASSET_MANAGER'].includes(req.user.role);
  if (!isOwner && !isAdminOrManager) {
    return next(new ApiError('Access denied: You cannot cancel this booking', 403));
  }

  if (booking.status === 'CANCELLED') {
    return next(new ApiError('Booking is already cancelled', 400));
  }
  if (booking.status === 'COMPLETED') {
    return next(new ApiError('Cannot cancel a completed booking', 400));
  }

  // Update booking status
  booking.status = 'CANCELLED';
  await booking.save();

  // Reset asset status to AVAILABLE
  const asset = await Asset.findById(booking.resourceId);
  if (asset) {
    asset.status = 'AVAILABLE';
    asset.history.push({
      action: 'STATUS_CHANGED',
      performedById: req.user._id,
      details: `Asset released from cancelled booking ID ${booking._id}`
    });
    await asset.save();
  }

  // Trigger notification
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: booking.employeeId,
      title: 'Booking Cancelled',
      message: `Your booking for resource ${asset ? asset.name : 'Asset'} has been cancelled.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'ALLOCATION',
      entityId: booking._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, {
      _id: booking._id,
      status: booking.status
    }, 'Booking cancelled successfully')
  );
});

module.exports = {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking
};
