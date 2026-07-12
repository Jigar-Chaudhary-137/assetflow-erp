const { body } = require('express-validator');
const mongoose = require('mongoose');

const createUserValidator = [];

const updateUserValidator = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  body('name')
    .optional()
    .trim(),
  
  body('role')
    .optional()
    .isIn(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']).withMessage('Invalid role value'),
  
  body('departmentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Department ID');
      }
      return true;
    }),
  
  body('contactNumber')
    .optional({ nullable: true })
    .trim(),

  body('phone')
    .optional({ nullable: true })
    .trim(),

  body('designation')
    .optional({ nullable: true })
    .trim(),

  body('joiningDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))) {
        throw new Error('Invalid Joining Date format');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Status must be ACTIVE, INACTIVE, or SUSPENDED')
];

module.exports = {
  createUserValidator,
  updateUserValidator
};
