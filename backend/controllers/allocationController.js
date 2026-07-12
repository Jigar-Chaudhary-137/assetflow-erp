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

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: employeeId,
      title: 'Asset Allocated',
      message: `Asset ${asset.name} (${asset.assetTag}) has been allocated to you.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'ALLOCATION',
      entityId: allocation._id.toString()
    });
  } catch (err) {}

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

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: allocation.employeeId,
      title: 'Asset Returned',
      message: `Asset ${asset.name} (${asset.assetTag}) has been returned successfully.`,
      type: 'SUCCESS',
      priority: 'LOW',
      module: 'ALLOCATION',
      entityId: allocation._id.toString()
    });
  } catch (err) {}

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

// ─── Transfer Bridge Functions (allocation-centric facade) ──────────────────
// The frontend calls /allocations/:id/transfer|approve-transfer|reject-transfer
// These bridge functions translate the allocationId to the Transfer model workflow.

const Transfer = require('../models/Transfer');

// @desc    Initiate transfer from an allocation (frontend: POST /allocations/:id/transfer)
// @access  Private (Admin, Manager, Staff)
const initiateTransferFromAllocation = asyncHandler(async (req, res, next) => {
  const allocationId = req.params.id;
  const { targetEmployeeId, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(allocationId)) {
    return next(new ApiError('Invalid Allocation ID format', 400));
  }

  const allocation = await Allocation.findById(allocationId);
  if (!allocation) {
    return next(new ApiError('Allocation not found', 404));
  }
  if (allocation.status !== 'ACTIVE') {
    return next(new ApiError('Only ACTIVE allocations can initiate a transfer', 400));
  }

  const toEmployeeId = targetEmployeeId;
  if (!toEmployeeId) {
    return next(new ApiError('targetEmployeeId is required', 400));
  }

  const toUser = await mongoose.model('User').findById(toEmployeeId);
  if (!toUser) {
    return next(new ApiError('Target employee not found', 404));
  }

  if (allocation.employeeId.toString() === toEmployeeId.toString()) {
    return next(new ApiError('Source and destination employees cannot be the same person', 400));
  }

  const asset = await Asset.findById(allocation.assetId);
  if (!asset) {
    return next(new ApiError('Asset not found for this allocation', 404));
  }

  const transfer = await Transfer.create({
    assetId: allocation.assetId,
    allocationId: allocation._id,
    fromEmployeeId: allocation.employeeId,
    toEmployeeId,
    requestedById: req.user._id,
    status: 'PENDING',
    comments: notes || null
  });

  // Mark allocation as transfer-pending
  allocation.transferStatus = 'PENDING_APPROVAL';
  allocation.transferRequestedTo = toEmployeeId;
  await allocation.save();

  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: toEmployeeId,
      title: 'Transfer Requested',
      message: `A request to transfer asset ${asset.name} (${asset.assetTag}) to you has been submitted.`,
      type: 'INFO', priority: 'MEDIUM', module: 'TRANSFER', entityId: transfer._id.toString()
    });
    const admins = await mongoose.model('User').find({ role: 'ADMIN' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        title: 'Transfer Requested',
        message: `A new transfer request has been submitted for asset ${asset.name} (${asset.assetTag}).`,
        type: 'INFO', priority: 'MEDIUM', module: 'TRANSFER', entityId: transfer._id.toString()
      });
    }
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, transfer, 'Transfer request submitted successfully')
  );
});

// @desc    Approve transfer from allocation context (frontend: POST /allocations/:id/approve-transfer)
const approveTransferFromAllocation = asyncHandler(async (req, res, next) => {
  const allocationId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(allocationId)) {
    return next(new ApiError('Invalid Allocation ID format', 400));
  }

  const transfer = await Transfer.findOne({ allocationId, status: 'PENDING' });
  if (!transfer) {
    return next(new ApiError('No pending transfer found for this allocation', 404));
  }

  const oldAllocation = await Allocation.findById(allocationId);
  if (oldAllocation && oldAllocation.status === 'ACTIVE') {
    oldAllocation.status = 'TRANSFERRED';
    oldAllocation.actualReturnDate = new Date();
    await oldAllocation.save();
  }

  const newAllocation = await Allocation.create({
    assetId: transfer.assetId,
    employeeId: transfer.toEmployeeId,
    allocatedById: req.user._id,
    allocatedDate: new Date(),
    status: 'ACTIVE'
  });

  const asset = await Asset.findById(transfer.assetId);
  if (asset) {
    const destinationUser = await mongoose.model('User').findById(transfer.toEmployeeId);
    if (destinationUser && destinationUser.departmentId) {
      asset.departmentId = destinationUser.departmentId;
    }
    asset.history.push({
      action: 'TRANSFERRED',
      performedById: req.user._id,
      details: `Asset transferred via allocation-centric transfer to User ID ${transfer.toEmployeeId}`
    });
    await asset.save();
  }

  transfer.status = 'APPROVED';
  transfer.actionById = req.user._id;
  transfer.actionDate = new Date();
  await transfer.save();

  return res.status(200).json(
    new ApiResponse(200, { transfer, newAllocation }, 'Transfer approved successfully')
  );
});

// @desc    Reject transfer from allocation context (frontend: POST /allocations/:id/reject-transfer)
const rejectTransferFromAllocation = asyncHandler(async (req, res, next) => {
  const allocationId = req.params.id;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(allocationId)) {
    return next(new ApiError('Invalid Allocation ID format', 400));
  }

  const transfer = await Transfer.findOne({ allocationId, status: 'PENDING' });
  if (!transfer) {
    return next(new ApiError('No pending transfer found for this allocation', 404));
  }

  transfer.status = 'REJECTED';
  transfer.actionById = req.user._id;
  transfer.actionDate = new Date();
  if (reason) {
    transfer.comments = `Rejection Reason: ${reason}`;
  }
  await transfer.save();

  // Restore allocation to ACTIVE
  const allocation = await Allocation.findById(allocationId);
  if (allocation) {
    allocation.status = 'ACTIVE';
    allocation.transferStatus = 'NONE';
    allocation.transferRequestedTo = null;
    await allocation.save();
  }

  return res.status(200).json(
    new ApiResponse(200, transfer, 'Transfer rejected successfully')
  );
});

module.exports = {
  allocateAsset,
  returnAsset,
  getActiveAllocations,
  getAllAllocations,
  getAllocationById,
  initiateTransferFromAllocation,
  approveTransferFromAllocation,
  rejectTransferFromAllocation
};
