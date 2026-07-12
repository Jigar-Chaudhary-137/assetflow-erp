const Department = require("../models/Department");
const User = require("../models/User");
const Asset = require("../models/Asset");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (Admin, Manager)

// check duplicate name and code
//check for parent dept id
//check for manager id
//check for status
//check for user role
const createDepartment = asyncHandler(async (req, res, next) => {
  const { name, code, managerId, parentDepartmentId } = req.body;

  // Duplicate checks
  const nameExists = await Department.findOne({ name });
  if (nameExists) {
    return next(new ApiError("Department name already exists", 400));
  }

  const codeExists = await Department.findOne({ code: code.toUpperCase() });
  if (codeExists) {
    return next(new ApiError("Department code already exists", 400));
  }

  // Manager check
  if (managerId) {
    const manager = await User.findById(managerId);
    if (!manager) {
      return next(new ApiError("Manager user not found", 404));
    }
  }

  // Parent department check
  if (parentDepartmentId) {
    const parent = await Department.findById(parentDepartmentId);
    if (!parent) {
      return next(new ApiError("Parent department not found", 404));
    }
  }

  const department = await Department.create({
    name,
    code: code.toUpperCase(),
    managerId: managerId || null,
    parentDepartmentId: parentDepartmentId || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, department, "Department created successfully"));
});

// @desc    Get all departments with pagination, search, sort, filter
// @route   GET /api/departments
// @access  Private (Admin, Manager, Staff)
const getDepartments = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};

  // Filtering
  if (status) {
    query.status = status;
  }

  // Search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination options
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await Department.countDocuments(query);
  const departments = await Department.find(query)
    .populate("managerId", "name email username role")
    .populate("parentDepartmentId", "name code")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        departments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Departments retrieved successfully",
    ),
  );
});

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private (Admin, Manager, Staff)
const getDepartmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Department ID format", 400));
  }

  const department = await Department.findById(id)
    .populate("managerId", "name email username role")
    .populate("parentDepartmentId", "name code");

  if (!department) {
    return next(new ApiError("Department not found", 404));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, department, "Department retrieved successfully"),
    );
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin, Manager)
const updateDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code, managerId, parentDepartmentId, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Department ID format", 400));
  }

  const department = await Department.findById(id);
  if (!department) {
    return next(new ApiError("Department not found", 404));
  }

  // Circular reference check
  if (parentDepartmentId && parentDepartmentId.toString() === id) {
    return next(new ApiError("A department cannot be its own parent", 400));
  }

  // Duplicate name check
  if (name && name !== department.name) {
    const nameExists = await Department.findOne({ name });
    if (nameExists) {
      return next(new ApiError("Department name already exists", 400));
    }
    department.name = name;
  }

  // Duplicate code check
  if (code && code.toUpperCase() !== department.code) {
    const codeExists = await Department.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return next(new ApiError("Department code already exists", 400));
    }
    department.code = code.toUpperCase();
  }

  // Manager check
  if (managerId !== undefined) {
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager) {
        return next(new ApiError("Manager user not found", 404));
      }
    }
    department.managerId = managerId || null;
  }

  // Parent department check
  if (parentDepartmentId !== undefined) {
    if (parentDepartmentId) {
      const parent = await Department.findById(parentDepartmentId);
      if (!parent) {
        return next(new ApiError("Parent department not found", 404));
      }
    }
    department.parentDepartmentId = parentDepartmentId || null;
  }

  if (status !== undefined) department.status = status;

  await department.save();

  return res
    .status(200)
    .json(new ApiResponse(200, department, "Department updated successfully"));
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin, Manager)
const deleteDepartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Department ID format", 400));
  }

  const department = await Department.findById(id);
  if (!department) {
    return next(new ApiError("Department not found", 404));
  }

  // Check if any sub-departments reference this department
  const hasSubDepartments = await Department.findOne({
    parentDepartmentId: id,
  });
  if (hasSubDepartments) {
    return next(
      new ApiError(
        "Cannot delete department: Sub-departments exist referencing it",
        400,
      ),
    );
  }

  // Check if any assets reference this department
  const hasAssets = await Asset.findOne({ departmentId: id });
  if (hasAssets) {
    return next(
      new ApiError(
        "Cannot delete department: Assets are currently assigned to it",
        400,
      ),
    );
  }

  // Check if any users reference this department (employees)
  const hasUsers = await User.findOne({ departmentId: id });
  if (hasUsers) {
    return next(
      new ApiError("Cannot delete department: Users belong to it", 400),
    );
  }

  await Department.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Department deleted successfully"));
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
