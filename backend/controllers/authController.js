const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, name, role, departmentId, contactNumber } =
    req.body;

  // Check if user already exists
  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    return next(new ApiError("Email already exists", 400));
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return next(new ApiError("Username already exists", 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    name,
    role,
    departmentId,
    contactNumber,
  });

  if (user) {
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      status: user.status,
      contactNumber: user.contactNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user: userData },
          "User registered successfully",
        ),
      );
  } else {
    return next(new ApiError("Invalid user data", 400));
  }
});

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: email }],
  });

  if (!user) {
    return next(new ApiError("Invalid credentials", 401));
  }

  if (user.status !== "ACTIVE") {
    return next(new ApiError("User account is suspended or inactive", 403));
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ApiError("Invalid credentials", 401));
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in database
  user.refreshToken = refreshToken;
  await user.save();
  console.log("user data: ", user);

  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    departmentId: user.departmentId,
    status: user.status,
    contactNumber: user.contactNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: userData, accessToken, refreshToken },
        "Login successful",
      ),
    );
});

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshTokens = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError("Invalid refresh token: User not found", 401));
    }

    // Compare with stored refresh token
    if (user.refreshToken !== refreshToken) {
      return next(new ApiError("Invalid refresh token: Token mismatch", 401));
    }

    // Generate new tokens (rotate refresh token)
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          "Token refreshed successfully",
        ),
      );
  } catch (error) {
    console.error(error);
    return next(new ApiError("Invalid or expired refresh token", 401));
  }
});

// @desc    Logout user & invalidate refresh token
// @route   POST /api/auth/logout
// @access  Public/Private
const logoutUser = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  let user;

  if (refreshToken) {
    user = await User.findOne({ refreshToken });
  }

  // If no user found by refresh token body, try using header if present
  if (!user && req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = verifyAccessToken(token);
      user = await User.findById(decoded.id);
    } catch (e) {
      // ignore verify errors during logout
    }
  }

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user profile retrieved successfully",
      ),
    );
});

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getCurrentUser,
};
