const Category = require("../models/Category");
const Asset = require("../models/Asset");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin, Manager)
// check duplicate name and code
// check if user is authorized
// save
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, code, description, customFields } = req.body;

  // Duplicate checks
  const nameExists = await Category.findOne({ name });
  if (nameExists) {
    return next(new ApiError("Category name already exists", 400));
  }

  const codeExists = await Category.findOne({ code: code.toUpperCase() });
  if (codeExists) {
    return next(new ApiError("Category code already exists", 400));
  }

  const category = await Category.create({
    name,
    code: code.toUpperCase(),
    description,
    customFields,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

// @desc    Get all categories with pagination, search, sort, filter
// @route   GET /api/categories
// @access  Private (Admin, Manager, Staff)
// filter by status
// search by name and code
// sort by createdAt, updatedAt, name, code, status
// pagination

const getCategories = asyncHandler(async (req, res, next) => {
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

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Categories retrieved successfully",
    ),
  );
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private (Admin, Manager, Staff)
const getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Category ID format", 400));
  }

  const category = await Category.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category retrieved successfully"));
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin, Manager)
const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code, description, status, customFields } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Category ID format", 400));
  }

  const category = await Category.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }

  // Check duplicate name
  if (name && name !== category.name) {
    const nameExists = await Category.findOne({ name });
    if (nameExists) {
      return next(new ApiError("Category name already exists", 400));
    }
    category.name = name;
  }

  // Check duplicate code
  if (code && code.toUpperCase() !== category.code) {
    const codeExists = await Category.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return next(new ApiError("Category code already exists", 400));
    }
    category.code = code.toUpperCase();
  }

  if (description !== undefined) category.description = description;
  if (status !== undefined) category.status = status;
  if (customFields !== undefined) category.customFields = customFields;

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin, Manager)
const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid Category ID format", 400));
  }

  const category = await Category.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }

  // Check if any assets reference this category
  const hasAssets = await Asset.findOne({ categoryId: id });
  if (hasAssets) {
    return next(
      new ApiError(
        "Cannot delete category: Assets are currently assigned to it",
        400,
      ),
    );
  }

  await Category.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
