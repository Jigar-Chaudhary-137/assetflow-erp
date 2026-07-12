const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// @desc    Get all activity logs with pagination, search, date range, module & user filters
// @route   GET /api/activity-logs
// @access  Private (Admin, Manager only)
const getActivityLogs = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    moduleName, 
    userId, 
    startDate, 
    endDate, 
    sortBy = 'createdAt', 
    order = 'desc' 
  } = req.query;

  const query = {};

  // Module filter
  if (moduleName) {
    query.module = moduleName.toUpperCase();
  }

  // User filter
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ApiError('Invalid User ID format', 400));
    }
    query.userId = userId;
  }

  // Date range filter (createdAt)
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search logic (userName, action, endpoint)
  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } },
      { endpoint: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate('userId', 'name username email role')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Activity logs retrieved successfully')
  );
});

// @desc    Get activity log by ID
// @route   GET /api/activity-logs/:id
// @access  Private (Admin, Manager only)
const getActivityLogById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid Activity Log ID format', 400));
  }

  const log = await ActivityLog.findById(id).populate('userId', 'name username email role');
  if (!log) {
    return next(new ApiError('Activity log not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, log, 'Activity log details retrieved successfully')
  );
});

module.exports = {
  getActivityLogs,
  getActivityLogById
};
