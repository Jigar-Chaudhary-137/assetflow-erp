const ApiError = require("../utils/ApiError");

const ROLE_WEIGHTS = {
  ADMIN: 3,
  Admin: 3,
  ASSET_MANAGER: 2,
  DEPARTMENT_HEAD: 2,
  Manager: 2,
  EMPLOYEE: 1,
  Staff: 1
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Not authorized, no user context", 401));
    }

    const userRole = req.user.role;
    const userWeight = ROLE_WEIGHTS[userRole] || 0;

    // Get the minimum weight required from the allowedRoles
    const requiredWeights = allowedRoles.map((role) => ROLE_WEIGHTS[role] || 0);
    const minRequiredWeight = Math.min(...requiredWeights);

    // If the user's role weight is greater than or equal to the minimum required weight, allow access
    if (userWeight >= minRequiredWeight && minRequiredWeight > 0) {
      return next();
    }

    return next(new ApiError("Forbidden: Access is denied", 403));
  };
};

module.exports = { authorize };
