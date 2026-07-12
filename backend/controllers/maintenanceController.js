const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    Schedule/Create a maintenance request
// @route   POST /api/maintenance
// @access  Private (Admin, Manager)
const createMaintenanceRequest = asyncHandler(async (req, res, next) => {
  const { assetId, issueDescription, priority, scheduledDate, estimatedCost, vendor, notes } = req.body;

  // 1. Verify asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  // 2. Verify asset is not retired
  if (asset.status === 'RETIRED') {
    return next(new ApiError('Cannot schedule maintenance for a retired asset', 400));
  }

  // 3. Verify only one active maintenance request per asset
  const activeRequestExists = await Maintenance.findOne({
    assetId,
    status: { $in: ['SCHEDULED', 'IN_PROGRESS'] }
  });
  if (activeRequestExists) {
    return next(new ApiError('An active maintenance task is already scheduled or in progress for this asset', 400));
  }

  const maintenance = await Maintenance.create({
    assetId,
    reportedById: req.user._id,
    issueDescription,
    priority,
    scheduledDate: new Date(scheduledDate),
    estimatedCost: estimatedCost || 0,
    vendor: vendor || null,
    notes: notes || null,
    status: 'SCHEDULED'
  });

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: req.user._id,
      title: 'Maintenance Scheduled',
      message: `Maintenance for asset ${asset.name} (${asset.assetTag}) has been scheduled on ${maintenance.scheduledDate}.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'MAINTENANCE',
      entityId: maintenance._id.toString()
    });
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, maintenance, 'Maintenance request scheduled successfully')
  );
});

// @desc    Start maintenance
// @route   PATCH /api/maintenance/:id/start
// @access  Private (Admin, Manager)
const startMaintenance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Maintenance ID format', 400));
  }

  const maintenance = await Maintenance.findById(id);
  if (!maintenance) {
    return next(new ApiError('Maintenance record not found', 404));
  }

  if (maintenance.status !== 'SCHEDULED') {
    return next(new ApiError(`Cannot start maintenance. Status is already ${maintenance.status}`, 400));
  }

  const asset = await Asset.findById(maintenance.assetId);
  if (!asset) {
    return next(new ApiError('Linked asset not found', 404));
  }

  // Start maintenance
  maintenance.status = 'IN_PROGRESS';
  maintenance.startedAt = new Date();
  await maintenance.save();

  // Change Asset status to UNDER_MAINTENANCE and update history
  asset.status = 'UNDER_MAINTENANCE';
  asset.history.push({
    action: 'STATUS_CHANGED',
    performedById: req.user._id,
    details: 'Asset set to UNDER_MAINTENANCE as maintenance work started'
  });
  await asset.save();

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: maintenance.reportedById,
      title: 'Maintenance Started',
      message: `Maintenance for asset ${asset.name} (${asset.assetTag}) is now in progress.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'MAINTENANCE',
      entityId: maintenance._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance work started successfully')
  );
});

// @desc    Complete maintenance
// @route   PATCH /api/maintenance/:id/complete
// @access  Private (Admin, Manager)
const completeMaintenance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { resolutionDetails, actualCost, vendor } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Maintenance ID format', 400));
  }

  const maintenance = await Maintenance.findById(id);
  if (!maintenance) {
    return next(new ApiError('Maintenance record not found', 404));
  }

  if (maintenance.status !== 'IN_PROGRESS') {
    return next(new ApiError(`Cannot complete maintenance. Status is currently ${maintenance.status}`, 400));
  }

  const asset = await Asset.findById(maintenance.assetId);
  if (!asset) {
    return next(new ApiError('Linked asset not found', 404));
  }

  // Complete maintenance
  maintenance.status = 'COMPLETED';
  maintenance.completionDate = new Date();
  maintenance.resolutionDetails = resolutionDetails;
  maintenance.actualCost = actualCost;
  if (vendor) maintenance.vendor = vendor;
  await maintenance.save();

  // Change Asset status back to AVAILABLE and update history
  asset.status = 'AVAILABLE';
  asset.history.push({
    action: 'MAINTENANCE_COMPLETED',
    performedById: req.user._id,
    details: `Maintenance completed. Resolution: ${resolutionDetails}. Cost: $${actualCost}`
  });
  await asset.save();

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: maintenance.reportedById,
      title: 'Maintenance Completed',
      message: `Maintenance for asset ${asset.name} (${asset.assetTag}) has been completed.`,
      type: 'SUCCESS',
      priority: 'MEDIUM',
      module: 'MAINTENANCE',
      entityId: maintenance._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance work completed successfully')
  );
});

// @desc    Cancel maintenance
// @route   PATCH /api/maintenance/:id/cancel
// @access  Private (Admin, Manager)
const cancelMaintenance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Maintenance ID format', 400));
  }

  const maintenance = await Maintenance.findById(id);
  if (!maintenance) {
    return next(new ApiError('Maintenance record not found', 404));
  }

  if (['COMPLETED', 'CANCELLED'].includes(maintenance.status)) {
    return next(new ApiError(`Cannot cancel maintenance. Status is already ${maintenance.status}`, 400));
  }

  const previousStatus = maintenance.status;

  // Cancel maintenance
  maintenance.status = 'CANCELLED';
  await maintenance.save();

  // Return asset status to AVAILABLE if maintenance was in progress (under maintenance)
  if (previousStatus === 'IN_PROGRESS') {
    const asset = await Asset.findById(maintenance.assetId);
    if (asset) {
      asset.status = 'AVAILABLE';
      asset.history.push({
        action: 'STATUS_CHANGED',
        performedById: req.user._id,
        details: 'Asset returned to AVAILABLE as maintenance was cancelled'
      });
      await asset.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance task cancelled successfully')
  );
});

// @desc    Get all maintenance tasks with pagination, filters, sorting, search
// @route   GET /api/maintenance
// @access  Private (Admin, Manager, Staff)
const getMaintenanceList = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    priority, 
    assetId, 
    startDate, 
    endDate, 
    sortBy = 'createdAt', 
    order = 'desc' 
  } = req.query;

  const query = {};

  // Filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assetId) query.assetId = assetId;

  // Date range filter
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  // Search logic (name, code, description)
  if (search) {
    const matchingAssets = await Asset.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const assetIds = matchingAssets.map(a => a._id);

    query.$or = [
      { issueDescription: { $regex: search, $options: 'i' } },
      { assetId: { $in: assetIds } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Maintenance.countDocuments(query);
  const list = await Maintenance.find(query)
    .populate('assetId', 'name assetTag serialNumber location status')
    .populate('reportedById', 'name username email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      list,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Maintenance task list retrieved successfully')
  );
});

// @desc    Get maintenance details by ID
// @route   GET /api/maintenance/:id
// @access  Private (Admin, Manager, Staff)
const getMaintenanceById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Maintenance ID format', 400));
  }

  const maintenance = await Maintenance.findById(id)
    .populate('assetId', 'name assetTag serialNumber specs location status')
    .populate('reportedById', 'name username email role');

  if (!maintenance) {
    return next(new ApiError('Maintenance record not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance details retrieved successfully')
  );
});

module.exports = {
  createMaintenanceRequest,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  getMaintenanceList,
  getMaintenanceById
};
