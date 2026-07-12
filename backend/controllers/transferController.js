const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    Create a transfer request
// @route   POST /api/transfers
// @access  Private (Admin, Manager, Staff)
const createTransferRequest = asyncHandler(async (req, res, next) => {
  const { assetId, toEmployeeId, comments } = req.body;

  // 1. Validate Asset exists and is not retired/maintenance
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  if (asset.status === 'RETIRED') {
    return next(new ApiError('Cannot transfer a retired asset', 400));
  }
  if (asset.status === 'UNDER_MAINTENANCE') {
    return next(new ApiError('Cannot transfer an asset currently under maintenance', 400));
  }

  // 2. Validate Asset has an ACTIVE allocation
  const activeAllocation = await Allocation.findOne({ assetId, status: 'ACTIVE' });
  if (!activeAllocation) {
    return next(new ApiError('Asset does not have an active allocation. Check out the asset first.', 400));
  }

  // 3. Destination user must exist
  const toUser = await User.findById(toEmployeeId);
  if (!toUser) {
    return next(new ApiError('Destination user (employee) not found', 404));
  }

  // 4. Source and destination cannot be the same
  if (activeAllocation.employeeId.toString() === toEmployeeId.toString()) {
    return next(new ApiError('Source and destination employees cannot be the same person', 400));
  }

  // Create Transfer record
  const transfer = await Transfer.create({
    assetId,
    allocationId: activeAllocation._id,
    fromEmployeeId: activeAllocation.employeeId,
    toEmployeeId,
    requestedById: req.user._id,
    status: 'PENDING',
    comments: comments || null
  });

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    // Notify target user
    await createNotification({
      recipient: toEmployeeId,
      title: 'Transfer Requested',
      message: `A request to transfer asset ${asset.name} (${asset.assetTag}) to you has been submitted.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'TRANSFER',
      entityId: transfer._id.toString()
    });
    // Notify Admins
    const User = require('../models/User');
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        title: 'Transfer Requested',
        message: `A new transfer request has been submitted for asset ${asset.name} (${asset.assetTag}).`,
        type: 'INFO',
        priority: 'MEDIUM',
        module: 'TRANSFER',
        entityId: transfer._id.toString()
      });
    }
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, transfer, 'Transfer request submitted successfully')
  );
});

// @desc    Approve transfer request
// @route   PATCH /api/transfers/:id/approve
// @access  Private (Admin, Manager)
const approveTransfer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Transfer ID format', 400));
  }

  const transfer = await Transfer.findById(id);
  if (!transfer) {
    return next(new ApiError('Transfer request not found', 404));
  }

  if (transfer.status !== 'PENDING') {
    return next(new ApiError(`Cannot approve transfer. Transfer is already ${transfer.status}`, 400));
  }

  // Find active allocation linked to transfer
  const oldAllocation = await Allocation.findById(transfer.allocationId);
  if (oldAllocation && oldAllocation.status === 'ACTIVE') {
    // Close the previous allocation
    oldAllocation.status = 'TRANSFERRED';
    oldAllocation.actualReturnDate = new Date();
    await oldAllocation.save();
  }

  // Create a new allocation for the destination user
  const newAllocation = await Allocation.create({
    assetId: transfer.assetId,
    employeeId: transfer.toEmployeeId,
    allocatedById: req.user._id,
    allocatedDate: new Date(),
    status: 'ACTIVE'
  });

  // Update Asset custodian department and history log
  const asset = await Asset.findById(transfer.assetId);
  if (asset) {
    const destinationUser = await User.findById(transfer.toEmployeeId);
    if (destinationUser && destinationUser.departmentId) {
      asset.departmentId = destinationUser.departmentId;
    }
    // Change status from ALLOCATED to ALLOCATED (refreshing trace details)
    asset.history.push({
      action: 'TRANSFERRED',
      performedById: req.user._id,
      details: `Asset transferred from User ID ${transfer.fromEmployeeId} to User ID ${transfer.toEmployeeId}`
    });
    await asset.save();
  }

  // Approve Transfer
  transfer.status = 'APPROVED';
  transfer.actionById = req.user._id;
  transfer.actionDate = new Date();
  await transfer.save();

  // Centralized notification triggers
  try {
    const { createNotification } = require('../services/notificationService');
    const assetName = asset ? asset.name : 'Asset';
    const assetTag = asset ? asset.assetTag : '';

    // Notify destination user
    await createNotification({
      recipient: transfer.toEmployeeId,
      title: 'Transfer Approved',
      message: `The transfer request for asset ${assetName} (${assetTag}) to you has been approved.`,
      type: 'SUCCESS',
      priority: 'HIGH',
      module: 'TRANSFER',
      entityId: transfer._id.toString()
    });

    // Notify source user
    await createNotification({
      recipient: transfer.fromEmployeeId,
      title: 'Transfer Approved',
      message: `The transfer request for asset ${assetName} (${assetTag}) currently with you has been approved.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'TRANSFER',
      entityId: transfer._id.toString()
    });

    // Notify requester (if different)
    if (transfer.requestedById.toString() !== transfer.toEmployeeId.toString() && 
        transfer.requestedById.toString() !== transfer.fromEmployeeId.toString()) {
      await createNotification({
        recipient: transfer.requestedById,
        title: 'Transfer Approved',
        message: `Your transfer request for asset ${assetName} (${assetTag}) has been approved.`,
        type: 'SUCCESS',
        priority: 'MEDIUM',
        module: 'TRANSFER',
        entityId: transfer._id.toString()
      });
    }
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, { transfer, newAllocation }, 'Transfer request approved successfully')
  );
});

// @desc    Reject transfer request
// @route   PATCH /api/transfers/:id/reject
// @access  Private (Admin, Manager)
const rejectTransfer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Transfer ID format', 400));
  }

  const transfer = await Transfer.findById(id);
  if (!transfer) {
    return next(new ApiError('Transfer request not found', 404));
  }

  if (transfer.status !== 'PENDING') {
    return next(new ApiError(`Cannot reject transfer. Transfer is already ${transfer.status}`, 400));
  }

  // Reject Transfer
  transfer.status = 'REJECTED';
  transfer.actionById = req.user._id;
  transfer.actionDate = new Date();
  if (reason) {
    transfer.comments = transfer.comments ? `${transfer.comments} | Rejection Reason: ${reason}` : `Rejection Reason: ${reason}`;
  }
  await transfer.save();

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: transfer.requestedById,
      title: 'Transfer Rejected',
      message: `Your transfer request for asset ID ${transfer.assetId} has been rejected. Reason: ${reason || 'None provided'}`,
      type: 'WARNING',
      priority: 'MEDIUM',
      module: 'TRANSFER',
      entityId: transfer._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, transfer, 'Transfer request rejected successfully')
  );
});

// @desc    Get all transfer requests (history) with filters, sorting, searching
// @route   GET /api/transfers
// @access  Private (Admin, Manager, Staff)
const getTransfers = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    assetId, 
    fromEmployeeId, 
    toEmployeeId, 
    startDate, 
    endDate, 
    sortBy = 'createdAt', 
    order = 'desc' 
  } = req.query;

  const query = {};

  // Filters
  if (status) query.status = status;
  if (assetId) query.assetId = assetId;
  if (fromEmployeeId) query.fromEmployeeId = fromEmployeeId;
  if (toEmployeeId) query.toEmployeeId = toEmployeeId;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search logic (resolving search string to user IDs / asset IDs)
  if (search) {
    const matchingUsers = await User.find({
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
      { fromEmployeeId: { $in: userIds } },
      { toEmployeeId: { $in: userIds } },
      { assetId: { $in: assetIds } },
      { comments: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Transfer.countDocuments(query);
  const transfers = await Transfer.find(query)
    .populate('assetId', 'name assetTag serialNumber location')
    .populate('fromEmployeeId', 'name email username role')
    .populate('toEmployeeId', 'name email username role')
    .populate('requestedById', 'name username')
    .populate('actionById', 'name username')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      transfers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Transfer requests retrieved successfully')
  );
});

// @desc    Get transfer details by ID
// @route   GET /api/transfers/:id
// @access  Private (Admin, Manager, Staff)
const getTransferById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Transfer ID format', 400));
  }

  const transfer = await Transfer.findById(id)
    .populate('assetId', 'name assetTag serialNumber location status specs')
    .populate('fromEmployeeId', 'name email username role designation')
    .populate('toEmployeeId', 'name email username role designation')
    .populate('requestedById', 'name email username role')
    .populate('actionById', 'name email username role');

  if (!transfer) {
    return next(new ApiError('Transfer request not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, transfer, 'Transfer details retrieved successfully')
  );
});

module.exports = {
  createTransferRequest,
  approveTransfer,
  rejectTransfer,
  getTransfers,
  getTransferById
};
