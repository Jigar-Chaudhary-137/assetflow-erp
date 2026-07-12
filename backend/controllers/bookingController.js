const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// Helper: check for overlapping bookings on the same asset
const checkOverlap = async (assetId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    assetId,
    status: { $in: ['PENDING', 'APPROVED'] },
    $or: [
      { startDate: { $lt: new Date(endDate) }, endDate: { $gt: new Date(startDate) } }
    ]
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  return await Booking.findOne(query);
};

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Any authenticated user)
const createBooking = asyncHandler(async (req, res, next) => {
  const { assetId, startDate, endDate, purpose, notes } = req.body;

  if (!assetId || !startDate || !endDate || !purpose) {
    return next(new ApiError('assetId, startDate, endDate and purpose are required', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(new ApiError('Invalid date format', 400));
  }

  if (start >= end) {
    return next(new ApiError('End date must be after start date', 400));
  }

  if (start < new Date()) {
    return next(new ApiError('Start date must be in the future', 400));
  }

  // Verify asset exists and is bookable
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }
  if (!asset.bookable) {
    return next(new ApiError('This asset is not available for booking', 400));
  }
  if (asset.status === 'RETIRED') {
    return next(new ApiError('Cannot book a retired asset', 400));
  }

  // Check for overlapping bookings
  const overlap = await checkOverlap(assetId, startDate, endDate);
  if (overlap) {
    return next(new ApiError('This asset already has an overlapping booking for the requested dates', 409));
  }

  const booking = await Booking.create({
    assetId,
    bookedById: req.user._id,
    startDate: start,
    endDate: end,
    purpose,
    notes: notes || null,
    status: 'PENDING'
  });

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    const User = require('../models/User');
    const admins = await User.find({ role: { $in: ['ADMIN', 'ASSET_MANAGER'] } });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        title: 'New Booking Request',
        message: `${req.user.name} requested booking of "${asset.name}" (${asset.assetTag}) from ${start.toDateString()} to ${end.toDateString()}.`,
        type: 'INFO',
        priority: 'MEDIUM',
        module: 'BOOKING',
        entityId: booking._id.toString()
      });
    }
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, booking, 'Booking request created successfully')
  );
});

// @desc    Approve a booking request
// @route   POST /api/bookings/:id/approve
// @access  Private (Admin, Manager)
const approveBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Booking ID format', 400));
  }

  const booking = await Booking.findById(id).populate('assetId', 'name assetTag bookable status');
  if (!booking) {
    return next(new ApiError('Booking not found', 404));
  }

  if (booking.status !== 'PENDING') {
    return next(new ApiError(`Cannot approve booking. Current status: ${booking.status}`, 400));
  }

  // Re-check for overlap excluding this booking
  const overlap = await checkOverlap(booking.assetId._id, booking.startDate, booking.endDate, id);
  if (overlap) {
    return next(new ApiError('Cannot approve: Overlapping approved booking exists', 409));
  }

  booking.status = 'APPROVED';
  booking.approvedById = req.user._id;
  booking.approvedDate = new Date();
  await booking.save();

  // Reserve the asset if it is currently AVAILABLE
  const asset = await Asset.findById(booking.assetId._id);
  if (asset && asset.status === 'AVAILABLE') {
    asset.status = 'RESERVED';
    await asset.save();
  }

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: booking.bookedById,
      title: 'Booking Approved',
      message: `Your booking request for "${asset ? asset.name : 'asset'}" has been approved.`,
      type: 'SUCCESS',
      priority: 'MEDIUM',
      module: 'BOOKING',
      entityId: booking._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, booking, 'Booking approved successfully')
  );
});

// @desc    Reject a booking request
// @route   POST /api/bookings/:id/reject
// @access  Private (Admin, Manager)
const rejectBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Booking ID format', 400));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError('Booking not found', 404));
  }

  if (booking.status !== 'PENDING') {
    return next(new ApiError(`Cannot reject booking. Current status: ${booking.status}`, 400));
  }

  booking.status = 'REJECTED';
  booking.rejectionReason = reason || null;
  await booking.save();

  // Restore asset to AVAILABLE if no other approved bookings exist for it
  const otherApproved = await Booking.findOne({
    assetId: booking.assetId,
    _id: { $ne: booking._id },
    status: 'APPROVED'
  });
  if (!otherApproved) {
    const asset = await Asset.findById(booking.assetId);
    if (asset && asset.status === 'RESERVED') {
      asset.status = 'AVAILABLE';
      await asset.save();
    }
  }

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: booking.bookedById,
      title: 'Booking Rejected',
      message: `Your booking request has been rejected. Reason: ${reason || 'No reason provided'}.`,
      type: 'WARNING',
      priority: 'MEDIUM',
      module: 'BOOKING',
      entityId: booking._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, booking, 'Booking rejected successfully')
  );
});

// @desc    Cancel a booking (by the requester)
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Booking ID format', 400));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new ApiError('Booking not found', 404));
  }

  // Allow cancellation only by the requester or admin
  if (booking.bookedById.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    return next(new ApiError('Access denied: Cannot cancel another user\'s booking', 403));
  }

  if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status)) {
    return next(new ApiError(`Cannot cancel booking. Current status: ${booking.status}`, 400));
  }

  const previousStatus = booking.status;
  booking.status = 'CANCELLED';
  await booking.save();

  // Restore asset if it was approved and reserved
  if (previousStatus === 'APPROVED') {
    const otherApproved = await Booking.findOne({
      assetId: booking.assetId,
      _id: { $ne: booking._id },
      status: 'APPROVED'
    });
    if (!otherApproved) {
      const asset = await Asset.findById(booking.assetId);
      if (asset && asset.status === 'RESERVED') {
        asset.status = 'AVAILABLE';
        await asset.save();
      }
    }
  }

  return res.status(200).json(
    new ApiResponse(200, booking, 'Booking cancelled successfully')
  );
});

// @desc    Get all bookings with pagination, filters, search
// @route   GET /api/bookings
// @access  Private (Admin, Manager see all; Staff see their own)
const getBookings = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    assetId,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const query = {};

  // Non-admin/manager users only see their own bookings
  if (!['ADMIN', 'ASSET_MANAGER'].includes(req.user.role)) {
    query.bookedById = req.user._id;
  }

  if (status) query.status = status;
  if (assetId) query.assetId = assetId;

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  if (search) {
    const Asset = require('../models/Asset');
    const matchingAssets = await Asset.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const assetIds = matchingAssets.map(a => a._id);

    const User = require('../models/User');
    const matchingUsers = await User.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    query.$or = [
      { assetId: { $in: assetIds } },
      { bookedById: { $in: userIds } },
      { purpose: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('assetId', 'name assetTag serialNumber location bookable')
    .populate('bookedById', 'name email username role')
    .populate('approvedById', 'name username')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Bookings retrieved successfully')
  );
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Booking ID format', 400));
  }

  const booking = await Booking.findById(id)
    .populate('assetId', 'name assetTag serialNumber location specs bookable status')
    .populate('bookedById', 'name email username role designation')
    .populate('approvedById', 'name username email role');

  if (!booking) {
    return next(new ApiError('Booking not found', 404));
  }

  // Access check: only requester or admin/manager can view
  if (
    booking.bookedById._id.toString() !== req.user._id.toString() &&
    !['ADMIN', 'ASSET_MANAGER'].includes(req.user.role)
  ) {
    return next(new ApiError('Access denied: Cannot view another user\'s booking', 403));
  }

  return res.status(200).json(
    new ApiResponse(200, booking, 'Booking details retrieved successfully')
  );
});

module.exports = {
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBookings,
  getBookingById
};
