const User = require('../models/User');
const Department = require('../models/Department');
const Allocation = require('../models/Allocation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



// @desc    Get all users (employees) with pagination, search, sort, filter
// @route   GET /api/users
// @access  Private (Admin, Manager, Staff)
const getUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, status, role, departmentId, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};

  // Filtering
  if (status) {
    query.status = status;
  }
  if (role) {
    query.role = role;
  }
  if (departmentId) {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return next(new ApiError('Invalid Department ID format', 400));
    }
    query.departmentId = departmentId;
  }

  // Search (username, name, email)
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination options
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-passwordHash -refreshToken')
    .populate('departmentId', 'name code')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Users retrieved successfully')
  );
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin, Manager, Staff)
const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid User ID format', 400));
  }

  const user = await User.findById(id)
    .select('-passwordHash -refreshToken')
    .populate('departmentId', 'name code');

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  return res.status(200).json(
    new ApiResponse(200, user, 'User details retrieved successfully')
  );
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin, Manager)
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { username, email, password, name, role, departmentId, contactNumber, phone, designation, joiningDate, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid User ID format', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Duplicate Username check
  if (username && username !== user.username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return next(new ApiError('Username already exists', 400));
    }
    user.username = username;
  }

  // Duplicate Email check
  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return next(new ApiError('Email already exists', 400));
    }
    user.email = email.toLowerCase();
  }

  // Password update
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
  }

  // Validate department if updated
  if (departmentId !== undefined) {
    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return next(new ApiError('Department not found', 404));
      }
    }
    user.departmentId = departmentId || null;
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (contactNumber !== undefined) user.contactNumber = contactNumber;
  if (phone !== undefined) user.phone = phone;
  if (designation !== undefined) user.designation = designation;
  if (joiningDate !== undefined) user.joiningDate = joiningDate;
  if (status !== undefined) user.status = status;

  await user.save();

  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    departmentId: user.departmentId,
    contactNumber: user.contactNumber,
    phone: user.phone,
    designation: user.designation,
    joiningDate: user.joiningDate,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return res.status(200).json(
    new ApiResponse(200, userData, 'User updated successfully')
  );
});

// @desc    Deactivate (soft delete) user
// @route   DELETE /api/users/:id
// @access  Private (Admin, Manager)
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid User ID format', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Check if user has active allocations
  const hasAllocations = await Allocation.findOne({ employeeId: id, status: 'ACTIVE' });
  if (hasAllocations) {
    return next(new ApiError('Cannot deactivate user: User has active asset allocations assigned', 400));
  }

  // Soft delete: deactivate user status
  user.status = 'INACTIVE';
  await user.save();

  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status
  };

  return res.status(200).json(
    new ApiResponse(200, userData, 'User deactivated successfully')
  );
});

// @desc    Patch user status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin, Manager)
const patchUserStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError('Invalid User ID format', 400));
  }

  if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    return next(new ApiError('Invalid status value. Must be ACTIVE, INACTIVE, or SUSPENDED', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // If setting to INACTIVE, check active allocations
  if (status === 'INACTIVE') {
    const hasAllocations = await Allocation.findOne({ employeeId: id, status: 'ACTIVE' });
    if (hasAllocations) {
      return next(new ApiError('Cannot deactivate user: User has active asset allocations assigned', 400));
    }
  }

  user.status = status;
  await user.save();

  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status
  };

  return res.status(200).json(
    new ApiResponse(200, userData, 'User status updated successfully')
  );
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  patchUserStatus
};
