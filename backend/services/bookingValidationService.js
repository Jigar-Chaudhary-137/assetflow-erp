const Asset = require('../models/Asset');
const User = require('../models/User');
const Department = require('../models/Department');
const Allocation = require('../models/Allocation');
const ApiError = require('../utils/ApiError');

/**
 * Validates booking/allocation rules for check-out.
 * @param {string} assetId 
 * @param {string} employeeId 
 * @param {Date} expectedReturnDate 
 * @returns {Promise<{asset, employee}>}
 */
const validateBooking = async (assetId, employeeId, expectedReturnDate) => {
  // 1. Asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError('Asset not found', 404);
  }

  // 2. User (Employee) exists
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new ApiError('Employee (User) not found', 404);
  }

  // 3. Department exists (if user belongs to one)
  if (employee.departmentId) {
    const department = await Department.findById(employee.departmentId);
    if (!department) {
      throw new ApiError('Department assigned to user does not exist', 404);
    }
  }

  // 4. Asset is not Retired or Under Maintenance or Allocated
  if (asset.status === 'RETIRED') {
    throw new ApiError('Asset is retired and cannot be allocated', 400);
  }

  if (asset.status === 'UNDER_MAINTENANCE') {
    throw new ApiError('Asset is under maintenance and cannot be allocated', 400);
  }

  if (asset.status !== 'AVAILABLE') {
    throw new ApiError(`Asset is not available for allocation. Current status: ${asset.status}`, 400);
  }

  // 5. Active allocation check
  const activeAllocation = await Allocation.findOne({ assetId, status: 'ACTIVE' });
  if (activeAllocation) {
    throw new ApiError('Asset already has an active allocation', 400);
  }

  // 6. Expected return date validation
  if (expectedReturnDate && new Date(expectedReturnDate) <= new Date()) {
    throw new ApiError('Expected return date must be in the future', 400);
  }

  return { asset, employee };
};

module.exports = {
  validateBooking
};
