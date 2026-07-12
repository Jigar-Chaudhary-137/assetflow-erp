const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const { validateBooking } = require('../services/bookingValidationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    Allocate an asset (Check Out)
// @route   POST /api/allocations
// @access  Private (Admin, Manager)
const allocateAsset = asyncHandler(async (req, res, next) => {
  const { assetId, employeeId, expectedReturnDate, notes } = req.body;

  // Run Booking Validation Service
  const { asset, employee } = await validateBooking(assetId, employeeId, expectedReturnDate);

  // Create Allocation record
  const allocation = await Allocation.create({
    assetId,
    employeeId,
    allocatedById: req.user._id,
    allocatedDate: new Date(),
    expectedReturnDate: expectedReturnDate || null,
    notes: notes || null,
    status: 'ACTIVE'
  });

  // Update Asset status and history
  asset.status = 'ALLOCATED';
  asset.history.push({
    action: 'ALLOCATED',
    performedById: req.user._id,
    details: `Asset checked out to user ${employee.name} (${employee.username})`
  });
  await asset.save();

  return res.status(201).json(
    new ApiResponse(201, allocation, 'Asset allocated successfully')
  );
});

// @desc    Return an allocated asset (Check In)
// @route   POST /api/allocations/:id/return
// @access  Private (Admin, Manager)
const returnAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Allocation ID format', 400));
  }

  // Find active allocation
  const allocation = await Allocation.findById(id);
  if (!allocation) {
    return next(new ApiError('Allocation record not found', 404));
  }

  if (allocation.status !== 'ACTIVE') {
    return next(new ApiError('This allocation is already returned or inactive', 400));
  }

  // Find linked asset
  const asset = await Asset.findById(allocation.assetId);
  if (!asset) {
    return next(new ApiError('Linked asset not found', 404));
  }

  // Update allocation record
  allocation.status = 'RETURNED';
  allocation.actualReturnDate = new Date();
  if (notes) {
    allocation.notes = allocation.notes ? `${allocation.notes} | Return Notes: ${notes}` : notes;
  }
  await allocation.save();

  // Change asset status back to AVAILABLE and add history entry
  asset.status = 'AVAILABLE';
  asset.history.push({
    action: 'RETURNED',
    performedById: req.user._id,
    details: 'Asset checked in / returned'
  });
  await asset.save();

  return res.status(200).json(
    new ApiResponse(200, allocation, 'Asset returned successfully')
  );
});

// @desc    Get active allocations
// @route   GET /api/allocations/active
// @access  Private (Admin, Manager, Staff)
const getActiveAllocations = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, sortBy = 'allocatedDate', order = 'desc' } = req.query;

  const query = { status: 'ACTIVE' };

  // Search could find allocations by user name or asset code
  // We can search populated sub-fields by first resolving matching IDs if query search exists
  if (search) {
    const matchingUsers = await mongoose.model('User').find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    const matchingAssets = await Asset.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const assetIds = matchingAssets.map(a => a._id);

    query.$or = [
      { employeeId: { $in: userIds } },
      { assetId: { $in: assetIds } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Allocation.countDocuments(query);
  const allocations = await Allocation.find(query)
    .populate('assetId', 'name assetTag serialNumber')
    .populate('employeeId', 'name email username')
    .populate('allocatedById', 'name username')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      allocations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Active allocations retrieved successfully')
  );
});

// @desc    Get all allocations (Allocation History)
// @route   GET /api/allocations
// @access  Private (Admin, Manager, Staff)
const getAllAllocations = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, status, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const matchingUsers = await mongoose.model('User').find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    const matchingAssets = await Asset.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const assetIds = matchingAssets.map(a => a._id);

    query.$or = [
      { employeeId: { $in: userIds } },
      { assetId: { $in: assetIds } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Allocation.countDocuments(query);
  const allocations = await Allocation.find(query)
    .populate('assetId', 'name assetTag serialNumber')
    .populate('employeeId', 'name email username')
    .populate('allocatedById', 'name username')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      allocations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Allocation history retrieved successfully')
  );
});

// @desc    Get allocation details by ID
// @route   GET /api/allocations/:id
// @access  Private (Admin, Manager, Staff)
const getAllocationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Allocation ID format', 400));
  }

  const allocation = await Allocation.findById(id)
    .populate('assetId', 'name assetTag serialNumber specs location status')
    .populate('employeeId', 'name email username role designation')
    .populate('allocatedById', 'name email username role');

  if (!allocation) {
    return next(new ApiError('Allocation record not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, allocation, 'Allocation details retrieved successfully')
  );
});

module.exports = {
  allocateAsset,
  returnAsset,
  getActiveAllocations,
  getAllAllocations,
  getAllocationById
};
