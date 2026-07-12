const Asset = require('../models/Asset');
const Category = require('../models/Category');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Private (Admin, Manager)
const createAsset = asyncHandler(async (req, res, next) => {
  const { 
    assetTag, 
    serialNumber, 
    name, 
    categoryId, 
    condition, 
    location, 
    departmentId, 
    status, 
    bookable, 
    specs, 
    purchaseInfo 
  } = req.body;

  // Prevent duplicate asset tag
  const tagExists = await Asset.findOne({ assetTag: assetTag.toUpperCase() });
  if (tagExists) {
    return next(new ApiError('Asset tag (code) already exists', 400));
  }

  // Prevent duplicate serial number
  const serialExists = await Asset.findOne({ serialNumber });
  if (serialExists) {
    return next(new ApiError('Serial number already exists', 400));
  }

  // Validate referenced Category
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new ApiError('Referenced category not found', 404));
  }

  // Validate referenced Department if provided
  if (departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      return next(new ApiError('Referenced department not found', 404));
    }
  }

  // Build registration history
  const registrationHistory = [{
    action: 'REGISTERED',
    performedById: req.user._id,
    details: 'Asset initially registered in the system'
  }];

  const asset = await Asset.create({
    assetTag: assetTag.toUpperCase(),
    serialNumber,
    name,
    categoryId,
    condition: condition || 'NEW',
    location,
    departmentId: departmentId || null,
    status: status || 'AVAILABLE',
    bookable: bookable !== undefined ? bookable : false,
    specs: specs || {},
    purchaseInfo: purchaseInfo || null,
    history: registrationHistory
  });

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: req.user._id,
      title: 'Asset Created',
      message: `Asset ${asset.name} (${asset.assetTag}) was successfully registered.`,
      type: 'SUCCESS',
      priority: 'LOW',
      module: 'ASSET',
      entityId: asset._id.toString()
    });
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, asset, 'Asset created successfully')
  );
});

// @desc    Get all assets with pagination, search, sort, filter
// @route   GET /api/assets
// @access  Private (Admin, Manager, Staff)
const getAssets = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    categoryId, 
    departmentId, 
    building, 
    sortBy = 'createdAt', 
    order = 'desc' 
  } = req.query;

  const query = {};

  // Filters
  if (status) {
    query.status = status;
  }
  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new ApiError('Invalid Category ID format', 400));
    }
    query.categoryId = categoryId;
  }
  if (departmentId) {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return next(new ApiError('Invalid Department ID format', 400));
    }
    query.departmentId = departmentId;
  }
  if (building) {
    query['location.building'] = { $regex: building, $options: 'i' };
  }

  // Search (name, assetTag, serialNumber)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { assetTag: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination options
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Asset.countDocuments(query);
  const assets = await Asset.find(query)
    .populate('categoryId', 'name code')
    .populate('departmentId', 'name code')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      assets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Assets retrieved successfully')
  );
});

// @desc    Get asset by ID
// @route   GET /api/assets/:id
// @access  Private (Admin, Manager, Staff)
const getAssetById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Asset ID format', 400));
  }

  const asset = await Asset.findById(id)
    .populate('categoryId', 'name code')
    .populate('departmentId', 'name code')
    .populate('history.performedById', 'name email username role');

  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, asset, 'Asset details retrieved successfully')
  );
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin, Manager)
const updateAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { 
    assetTag, 
    serialNumber, 
    name, 
    categoryId, 
    condition, 
    location, 
    departmentId, 
    status, 
    bookable, 
    specs, 
    purchaseInfo 
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Asset ID format', 400));
  }

  const asset = await Asset.findById(id);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  // Duplicate tag check
  if (assetTag && assetTag.toUpperCase() !== asset.assetTag) {
    const tagExists = await Asset.findOne({ assetTag: assetTag.toUpperCase() });
    if (tagExists) {
      return next(new ApiError('Asset tag (code) already exists', 400));
    }
    asset.assetTag = assetTag.toUpperCase();
  }

  // Duplicate serial check
  if (serialNumber && serialNumber !== asset.serialNumber) {
    const serialExists = await Asset.findOne({ serialNumber });
    if (serialExists) {
      return next(new ApiError('Serial number already exists', 400));
    }
    asset.serialNumber = serialNumber;
  }

  // Category validate
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new ApiError('Referenced category not found', 404));
    }
    asset.categoryId = categoryId;
  }

  // Department validate
  if (departmentId !== undefined) {
    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return next(new ApiError('Referenced department not found', 404));
      }
    }
    asset.departmentId = departmentId || null;
  }

  // Status check & status change history logging
  if (status && status !== asset.status) {
    asset.history.push({
      action: 'STATUS_CHANGED',
      performedById: req.user._id,
      details: `Asset status updated from ${asset.status} to ${status}`
    });
    asset.status = status;
  }

  if (name !== undefined) asset.name = name;
  if (condition !== undefined) asset.condition = condition;
  if (location !== undefined) asset.location = location;
  if (bookable !== undefined) asset.bookable = bookable;
  if (specs !== undefined) asset.specs = specs;
  if (purchaseInfo !== undefined) asset.purchaseInfo = purchaseInfo;

  await asset.save();

  return res.status(200).json(
    new ApiResponse(200, asset, 'Asset updated successfully')
  );
});

// @desc    Retire / Soft Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin, Manager)
const deleteAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Asset ID format', 400));
  }

  const asset = await Asset.findById(id);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  // Soft delete: status change to RETIRED
  if (asset.status !== 'RETIRED') {
    asset.history.push({
      action: 'STATUS_CHANGED',
      performedById: req.user._id,
      details: 'Asset retired / soft-deleted from the system'
    });
    asset.status = 'RETIRED';
    await asset.save();
  }

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: req.user._id,
      title: 'Asset Retired',
      message: `Asset ${asset.name} (${asset.assetTag}) has been retired.`,
      type: 'WARNING',
      priority: 'MEDIUM',
      module: 'ASSET',
      entityId: asset._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, asset, 'Asset retired successfully')
  );
});

// @desc    Patch asset status
// @route   PATCH /api/assets/:id/status
// @access  Private (Admin, Manager)
const patchAssetStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Asset ID format', 400));
  }

  const asset = await Asset.findById(id);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  const oldStatus = asset.status;
  asset.status = status;
  if (notes) {
    asset.notes = notes;
  }

  asset.history.push({
    action: 'STATUS_CHANGED',
    performedById: req.user._id,
    details: `Status updated via patch from ${oldStatus} to ${status}. Notes: ${notes || 'None'}`
  });

  await asset.save();

  return res.status(200).json(
    new ApiResponse(200, asset, 'Asset status updated successfully')
  );
});

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  patchAssetStatus
};

