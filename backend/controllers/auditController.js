const Audit = require('../models/Audit');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    Create an audit cycle
// @route   POST /api/audits
// @access  Private (Admin, Manager)
const createAuditCycle = asyncHandler(async (req, res, next) => {
  const { 
    auditCode, 
    auditName, 
    auditType, 
    scheduledDate, 
    auditorId, 
    targetDepartmentId, 
    targetCategoryId, 
    location, 
    scope, 
    remarks, 
    selectedAssets 
  } = req.body;

  // 1. Prevent duplicate audit code
  const codeExists = await Audit.findOne({ auditCode: auditCode.toUpperCase() });
  if (codeExists) {
    return next(new ApiError('Audit code already exists', 400));
  }

  // 2. Validate auditor user
  const auditor = await User.findById(auditorId);
  if (!auditor) {
    return next(new ApiError('Auditor user not found', 404));
  }

  // 3. Validate department if provided
  if (targetDepartmentId) {
    const department = await Department.findById(targetDepartmentId);
    if (!department) {
      return next(new ApiError('Referenced target department not found', 404));
    }
  }

  // 4. Validate category if provided
  if (targetCategoryId) {
    const category = await Category.findById(targetCategoryId);
    if (!category) {
      return next(new ApiError('Referenced target category not found', 404));
    }
  }

  const audit = await Audit.create({
    auditCode: auditCode.toUpperCase(),
    auditName,
    auditType: auditType || null,
    scheduledDate: new Date(scheduledDate),
    auditorId,
    targetDepartmentId: targetDepartmentId || null,
    targetCategoryId: targetCategoryId || null,
    location: location || null,
    scope: scope || null,
    remarks: remarks || null,
    selectedAssets: selectedAssets || [],
    status: 'PENDING'
  });

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: auditorId,
      title: 'Audit Assigned',
      message: `You have been assigned to audit cycle ${audit.auditName} (${audit.auditCode}).`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'AUDIT',
      entityId: audit._id.toString()
    });
  } catch (err) {}

  return res.status(201).json(
    new ApiResponse(201, audit, 'Audit cycle created successfully')
  );
});

// @desc    Start an audit
// @route   PATCH /api/audits/:id/start
// @access  Private (Admin, Manager)
const startAudit = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Audit ID format', 400));
  }

  const audit = await Audit.findById(id);
  if (!audit) {
    return next(new ApiError('Audit not found', 404));
  }

  if (audit.status !== 'PENDING') {
    return next(new ApiError(`Cannot start audit. Current status is ${audit.status}`, 400));
  }

  audit.status = 'IN_PROGRESS';
  audit.startedAt = new Date();
  await audit.save();

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: audit.auditorId,
      title: 'Audit Started',
      message: `Audit cycle ${audit.auditName} (${audit.auditCode}) is now in progress.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'AUDIT',
      entityId: audit._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, audit, 'Audit started successfully')
  );
});

// @desc    Verify each asset in an audit cycle
// @route   PATCH /api/audits/:id/verify
// @access  Private (Admin, Manager, Staff / Auditor)
const verifyAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { assetId, found, condition, remarks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Audit ID format', 400));
  }

  const audit = await Audit.findById(id);
  if (!audit) {
    return next(new ApiError('Audit not found', 404));
  }

  // Audit must be in progress
  if (audit.status !== 'IN_PROGRESS') {
    return next(new ApiError('Assets can only be verified in an IN_PROGRESS audit', 400));
  }

  // Prevent duplicate verification
  const alreadyVerified = audit.verifiedAssets.find(va => va.assetId.toString() === assetId.toString());
  if (alreadyVerified) {
    return next(new ApiError('Asset has already been verified in this audit cycle', 400));
  }

  // Validate asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new ApiError('Asset not found', 404));
  }

  // Record asset verification
  audit.verifiedAssets.push({
    assetId,
    found,
    condition,
    remarks: remarks || null,
    verifiedAt: new Date()
  });

  await audit.save();

  // Keep asset condition / status updated if needed
  if (!found) {
    asset.status = 'LOST';
  } else if (condition === 'DAMAGED') {
    asset.condition = 'DAMAGED';
  }
  
  asset.history.push({
    action: 'STATUS_CHANGED',
    performedById: req.user._id,
    details: `Verified in audit code ${audit.auditCode}. Found: ${found}. Condition: ${condition}. Remarks: ${remarks || 'None'}`
  });
  await asset.save();

  return res.status(200).json(
    new ApiResponse(200, audit, 'Asset verified successfully')
  );
});

// @desc    Complete an audit and generate verification summary
// @route   PATCH /api/audits/:id/complete
// @access  Private (Admin, Manager)
const completeAudit = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Audit ID format', 400));
  }

  const audit = await Audit.findById(id);
  if (!audit) {
    return next(new ApiError('Audit not found', 404));
  }

  if (audit.status !== 'IN_PROGRESS') {
    return next(new ApiError('Cannot complete audit. Only audits in IN_PROGRESS state can be completed.', 400));
  }

  // Generate summary count
  let totalAudited = audit.verifiedAssets.length;
  let foundCount = 0;
  let missingCount = 0;
  let damagedCount = 0;

  for (const item of audit.verifiedAssets) {
    if (item.found) foundCount++;
    if (item.condition === 'MISSING') missingCount++;
    if (item.condition === 'DAMAGED') damagedCount++;
  }

  audit.status = 'COMPLETED';
  audit.completedAt = new Date();
  audit.summary = {
    totalAudited,
    found: foundCount,
    missing: missingCount,
    damaged: damagedCount
  };

  // Centralized notification trigger
  try {
    const { createNotification } = require('../services/notificationService');
    await createNotification({
      recipient: audit.auditorId,
      title: 'Audit Completed',
      message: `Audit cycle ${audit.auditName} (${audit.auditCode}) has been completed. Summary: Total Audited: ${totalAudited}, Found: ${foundCount}, Missing: ${missingCount}, Damaged: ${damagedCount}`,
      type: 'SUCCESS',
      priority: 'HIGH',
      module: 'AUDIT',
      entityId: audit._id.toString()
    });
  } catch (err) {}

  return res.status(200).json(
    new ApiResponse(200, audit, 'Audit completed and summary generated successfully')
  );
});

// @desc    Get all audits with pagination, sorting, search, filtering
// @route   GET /api/audits
// @access  Private (Admin, Manager, Staff)
const getAudits = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    auditorId, 
    targetDepartmentId, 
    startDate, 
    endDate, 
    sortBy = 'createdAt', 
    order = 'desc' 
  } = req.query;

  const query = {};

  // Filters
  if (status) query.status = status;
  if (auditorId) {
    if (!mongoose.Types.ObjectId.isValid(auditorId)) {
      return next(new ApiError('Invalid Auditor ID format', 400));
    }
    query.auditorId = auditorId;
  }
  if (targetDepartmentId) {
    if (!mongoose.Types.ObjectId.isValid(targetDepartmentId)) {
      return next(new ApiError('Invalid Department ID format', 400));
    }
    query.targetDepartmentId = targetDepartmentId;
  }

  // Date range filter (scheduledDate)
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  // Search logic
  if (search) {
    query.$or = [
      { auditCode: { $regex: search, $options: 'i' } },
      { auditName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Audit.countDocuments(query);
  const audits = await Audit.find(query)
    .populate('auditorId', 'name username email')
    .populate('targetDepartmentId', 'name code')
    .populate('targetCategoryId', 'name code')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      audits,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Audit cycle records retrieved successfully')
  );
});

// @desc    Get audit details by ID
// @route   GET /api/audits/:id
// @access  Private (Admin, Manager, Staff)
const getAuditById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Audit ID format', 400));
  }

  const audit = await Audit.findById(id)
    .populate('auditorId', 'name email username role')
    .populate('targetDepartmentId', 'name code')
    .populate('targetCategoryId', 'name code')
    .populate('selectedAssets', 'name assetTag serialNumber location status')
    .populate('verifiedAssets.assetId', 'name assetTag serialNumber location');

  if (!audit) {
    return next(new ApiError('Audit not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, audit, 'Audit details retrieved successfully')
  );
});

module.exports = {
  createAuditCycle,
  startAudit,
  verifyAsset,
  completeAudit,
  getAudits,
  getAuditById
};
