const { verifyAccessToken } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      // Get user from the token, exclude passwordHash and refreshToken
      req.user = await User.findById(decoded.id).select('-passwordHash -refreshToken');

      if (!req.user) {
        return next(new ApiError('Not authorized, user not found', 401));
      }

      if (req.user.status !== 'ACTIVE') {
        return next(new ApiError('User account is not active', 403));
      }

      next();
    } catch (error) {
      console.error(error);
      return next(new ApiError('Not authorized, token failed or expired', 401));
    }
  }

  if (!token) {
    return next(new ApiError('Not authorized, no token provided', 401));
  }
});

module.exports = { protect };
