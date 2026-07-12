const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// @desc    Get all notifications with pagination, sorting, search, filtering
// @route   GET /api/notifications
// @access  Private (Admin can view all, others view their own)
const getNotifications = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    unread,
    type,
    priority,
    startDate,
    endDate,
    sortBy = "createdAt",
    order = "desc",
    all,
  } = req.query;

  const query = {};

  // RBAC limit checks
  if (req.user.role === "ADMIN" && all === "true") {
    // Admin is querying all notifications in the system
  } else {
    // Normal users and admins (by default) only query their own
    query.recipient = req.user._id;
  }

  // Filters
  if (unread === "true") {
    query.isRead = false;
  } else if (unread === "false") {
    query.isRead = true;
  }

  if (type) {
    query.type = type;
  }

  if (priority) {
    query.priority = priority.toUpperCase();
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search logic (title/message)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .populate("recipient", "name username email role")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Notifications retrieved successfully",
    ),
  );
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private (Own notification, or Admin)
const getNotificationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Notification ID format", 400));
  }

  const notification = await Notification.findById(id).populate(
    "recipient",
    "name username email role",
  );
  if (!notification) {
    return next(new ApiError("Notification not found", 404));
  }

  // Access check
  if (
    notification.recipient._id.toString() !== req.user._id.toString() &&
    req.user.role !== "ADMIN"
  ) {
    return next(
      new ApiError("Access denied: Cannot view other users notifications", 403),
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        "Notification details retrieved successfully",
      ),
    );
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Own notification)
const readNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Notification ID format", 400));
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new ApiError("Notification not found", 404));
  }

  // Access check
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(
      new ApiError("Access denied: Cannot read other users notifications", 403),
    );
  }

  notification.isRead = true;
  await notification.save();

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

// @desc    Mark all notifications for logged-in user as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const readAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Own notification, or Admin)
const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Notification ID format", 400));
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new ApiError("Notification not found", 404));
  }

  // Access check
  if (
    notification.recipient.toString() !== req.user._id.toString() &&
    req.user.role !== "ADMIN"
  ) {
    return next(
      new ApiError(
        "Access denied: Cannot delete other users notifications",
        403,
      ),
    );
  }

  await Notification.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});

// @desc    Clear all notifications (Bulk Delete)
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = asyncHandler(async (req, res, next) => {
  const query = req.user.role === "ADMIN" ? {} : { recipient: req.user._id };
  await Notification.deleteMany(query);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications cleared successfully"));
});

module.exports = {
  getNotifications,
  getNotificationById,
  readNotification,
  readAllNotifications,
  deleteNotification,
  clearNotifications,
};
