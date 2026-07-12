const Allocation = require("../models/Allocation");
const Asset = require("../models/Asset");
const { validateBooking } = require("../services/bookingValidationService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// @desc    Allocate an asset (Check Out)
// @route   POST /api/allocations
// @access  Private (Admin, Manager)
const allocateAsset = asyncHandler(async (req, res, next) => {
  const { assetId, employeeId, expectedReturnDate, notes } = req.body;

  // Run Booking Validation Service
  const { asset, employee } = await validateBooking(
    assetId,
    employeeId,
    expectedReturnDate,
  );

  // Create Allocation record
  const allocation = await Allocation.create({
    assetId,
    employeeId,
    allocatedById: req.user._id,
    allocatedDate: new Date(),
    expectedReturnDate: expectedReturnDate || null,
    notes: notes || null,
    status: "ACTIVE",
  });

  // Update Asset status and history
  asset.status = "ALLOCATED";
  asset.history.push({
    action: "ALLOCATED",
    performedById: req.user._id,
    details: `Asset checked out to user ${employee.name} (${employee.username})`,
  });
  await asset.save();

  // Centralized notification trigger
  try {
    const { createNotification } = require("../services/notificationService");
    await createNotification({
      recipient: employeeId,
      title: "Asset Allocated",
      message: `Asset ${asset.name} (${asset.assetTag}) has been allocated to you.`,
      type: "INFO",
      priority: "MEDIUM",
      module: "ALLOCATION",
      entityId: allocation._id.toString(),
    });
  } catch (err) {}

  return res
    .status(201)
    .json(new ApiResponse(201, allocation, "Asset allocated successfully"));
});

// @desc    Return an allocated asset (Check In)
// @route   POST /api/allocations/:id/return
// @access  Private (Admin, Manager)
const returnAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Allocation ID format", 400));
  }

  // Find active allocation
  const allocation = await Allocation.findById(id);
  if (!allocation) {
    return next(new ApiError("Allocation record not found", 404));
  }

  if (allocation.status !== "ACTIVE") {
    return next(
      new ApiError("This allocation is already returned or inactive", 400),
    );
  }

  // Find linked asset
  const asset = await Asset.findById(allocation.assetId);
  if (!asset) {
    return next(new ApiError("Linked asset not found", 404));
  }

  // Update allocation record
  allocation.status = "RETURNED";
  allocation.actualReturnDate = new Date();
  if (notes) {
    allocation.notes = allocation.notes
      ? `${allocation.notes} | Return Notes: ${notes}`
      : notes;
  }
  await allocation.save();

  // Change asset status back to AVAILABLE and add history entry
  asset.status = "AVAILABLE";
  asset.history.push({
    action: "RETURNED",
    performedById: req.user._id,
    details: "Asset checked in / returned",
  });
  await asset.save();

  // Centralized notification trigger
  try {
    const { createNotification } = require("../services/notificationService");
    await createNotification({
      recipient: allocation.employeeId,
      title: "Asset Returned",
      message: `Asset ${asset.name} (${asset.assetTag}) has been returned successfully.`,
      type: "SUCCESS",
      priority: "LOW",
      module: "ALLOCATION",
      entityId: allocation._id.toString(),
    });
  } catch (err) {}

  return res
    .status(200)
    .json(new ApiResponse(200, allocation, "Asset returned successfully"));
});

// @desc    Get active allocations
// @route   GET /api/allocations/active
// @access  Private (Admin, Manager, Staff)
const getActiveAllocations = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "allocatedDate",
    order = "desc",
  } = req.query;

  const query = { status: "ACTIVE" };

  // Search could find allocations by user name or asset code
  // We can search populated sub-fields by first resolving matching IDs if query search exists
  if (search) {
    const matchingUsers = await mongoose
      .model("User")
      .find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      })
      .select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    const matchingAssets = await Asset.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { assetTag: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    const assetIds = matchingAssets.map((a) => a._id);

    query.$or = [
      { employeeId: { $in: userIds } },
      { assetId: { $in: assetIds } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Allocation.countDocuments(query);
  const allocations = await Allocation.find(query)
    .populate("assetId", "name assetTag serialNumber")
    .populate("employeeId", "name email username")
    .populate("allocatedById", "name username")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        allocations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Active allocations retrieved successfully",
    ),
  );
});

// @desc    Get all allocations (Allocation History)
// @route   GET /api/allocations
// @access  Private (Admin, Manager, Staff)
const getAllAllocations = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const matchingUsers = await mongoose
      .model("User")
      .find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      })
      .select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    const matchingAssets = await Asset.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { assetTag: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    const assetIds = matchingAssets.map((a) => a._id);

    query.$or = [
      { employeeId: { $in: userIds } },
      { assetId: { $in: assetIds } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Allocation.countDocuments(query);
  const allocations = await Allocation.find(query)
    .populate("assetId", "name assetTag serialNumber")
    .populate("employeeId", "name email username")
    .populate("allocatedById", "name username")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        allocations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Allocation history retrieved successfully",
    ),
  );
});

// @desc    Get allocation details by ID
// @route   GET /api/allocations/:id
// @access  Private (Admin, Manager, Staff)
const getAllocationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Allocation ID format", 400));
  }

  const allocation = await Allocation.findById(id)
    .populate("assetId", "name assetTag serialNumber specs location status")
    .populate("employeeId", "name email username role designation")
    .populate("allocatedById", "name email username role");

  if (!allocation) {
    return next(new ApiError("Allocation record not found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allocation,
        "Allocation details retrieved successfully",
      ),
    );
});

// @desc    Request Allocation Transfer
// @route   POST /api/allocations/:id/transfer
// @access  Private (Assignee / Holder, or Dept Head / Admin / Manager)
const requestAllocationTransfer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { transferRequestedTo, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Allocation ID format", 400));
  }

  const allocation = await Allocation.findById(id);
  if (!allocation) {
    return next(new ApiError("Allocation not found", 404));
  }

  if (allocation.status !== "ACTIVE") {
    return next(new ApiError("Can only transfer active allocations", 400));
  }

  // Authorization check: User must be the employee currently assigned, or department head, or manager/admin
  const isHolder = allocation.employeeId.toString() === req.user._id.toString();
  const isAuthorized =
    isHolder ||
    ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(req.user.role);

  if (!isAuthorized) {
    return next(
      new ApiError(
        "Forbidden: You are not authorized to transfer this allocation",
        403,
      ),
    );
  }

  if (!mongoose.Types.ObjectId.isValid(transferRequestedTo)) {
    return next(new ApiError("Invalid Destination User ID format", 400));
  }

  const toUser = await mongoose.model("User").findById(transferRequestedTo);
  if (!toUser) {
    return next(new ApiError("Destination user not found", 404));
  }

  if (toUser.status !== "ACTIVE") {
    return next(new ApiError("Cannot transfer to an inactive user", 400));
  }

  if (allocation.employeeId.toString() === transferRequestedTo) {
    return next(
      new ApiError("Source and destination users cannot be the same", 400),
    );
  }

  allocation.transferStatus = "PENDING_APPROVAL";
  allocation.transferRequestedTo = transferRequestedTo;
  if (notes) {
    allocation.notes = allocation.notes
      ? `${allocation.notes} | Transfer Request Notes: ${notes}`
      : notes;
  }
  await allocation.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: allocation._id,
        transferStatus: allocation.transferStatus,
        transferRequestedTo: allocation.transferRequestedTo,
      },
      "Transfer requested successfully",
    ),
  );
});

// @desc    Approve Allocation Transfer
// @route   PATCH /api/allocations/:id/transfer/approve
// @access  Private (Admin, Manager, Department Head)
const approveAllocationTransfer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Allocation ID format", 400));
  }

  const oldAllocation = await Allocation.findById(id);
  if (!oldAllocation) {
    return next(new ApiError("Allocation not found", 404));
  }

  if (
    oldAllocation.status !== "ACTIVE" ||
    oldAllocation.transferStatus !== "PENDING_APPROVAL"
  ) {
    return next(
      new ApiError(
        "No pending transfer request found for this allocation",
        400,
      ),
    );
  }

  const toUser = await mongoose
    .model("User")
    .findById(oldAllocation.transferRequestedTo);
  if (!toUser) {
    return next(new ApiError("Destination user not found", 404));
  }

  // Close the old allocation
  oldAllocation.status = "TRANSFERRED";
  oldAllocation.transferStatus = "APPROVED";
  oldAllocation.actualReturnDate = new Date();
  await oldAllocation.save();

  // Create new allocation
  const newAllocation = await Allocation.create({
    assetId: oldAllocation.assetId,
    employeeId: oldAllocation.transferRequestedTo,
    allocatedById: req.user._id,
    allocatedDate: new Date(),
    status: "ACTIVE",
    transferStatus: "NONE",
    notes: `Transferred from User ID ${oldAllocation.employeeId}`,
  });

  // Update Asset custodian department and history log
  const asset = await Asset.findById(oldAllocation.assetId);
  if (asset) {
    if (toUser.departmentId) {
      asset.departmentId = toUser.departmentId;
    }
    asset.history.push({
      action: "TRANSFERRED",
      performedById: req.user._id,
      details: `Asset transferred from User ID ${oldAllocation.employeeId} to User ID ${oldAllocation.transferRequestedTo}`,
    });
    await asset.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        previousAllocation: {
          _id: oldAllocation._id,
          status: oldAllocation.status,
          transferStatus: oldAllocation.transferStatus,
        },
        newAllocation: {
          _id: newAllocation._id,
          assetId: newAllocation.assetId,
          employeeId: newAllocation.employeeId,
          status: newAllocation.status,
          transferStatus: newAllocation.transferStatus,
        },
      },
      "Transfer approved successfully",
    ),
  );
});

// @desc    Reject Allocation Transfer
// @route   PATCH /api/allocations/:id/transfer/reject
// @access  Private (Admin, Manager, Department Head)
const rejectAllocationTransfer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Allocation ID format", 400));
  }

  const allocation = await Allocation.findById(id);
  if (!allocation) {
    return next(new ApiError("Allocation not found", 404));
  }

  if (
    allocation.status !== "ACTIVE" ||
    allocation.transferStatus !== "PENDING_APPROVAL"
  ) {
    return next(
      new ApiError(
        "No pending transfer request found for this allocation",
        400,
      ),
    );
  }

  allocation.transferStatus = "NONE";
  allocation.transferRequestedTo = null;
  await allocation.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: allocation._id,
        transferStatus: allocation.transferStatus,
        transferRequestedTo: allocation.transferRequestedTo,
      },
      "Transfer request rejected",
    ),
  );
});

module.exports = {
  allocateAsset,
  returnAsset,
  getActiveAllocations,
  getAllAllocations,
  getAllocationById,
  requestAllocationTransfer,
  approveAllocationTransfer,
  rejectAllocationTransfer,
};
