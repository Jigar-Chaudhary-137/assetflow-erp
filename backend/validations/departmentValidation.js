const { body } = require('express-validator');
const mongoose = require('mongoose');

const createDepartmentValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
  
  body('code')
    .trim()
    .notEmpty().withMessage('Department code is required')
    .isLength({ min: 2, max: 10 }).withMessage('Department code must be between 2 and 10 characters')
    .toUpperCase()
    .matches(/^[A-Z0-9]+$/).withMessage('Department code must be uppercase alphanumeric'),
  
  body('managerId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Manager User ID format');
      }
      return true;
    }),
  
  body('parentDepartmentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Parent Department ID format');
      }
      return true;
    })
];

const updateDepartmentValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 }).withMessage('Department code must be between 2 and 10 characters')
    .toUpperCase()
    .matches(/^[A-Z0-9]+$/).withMessage('Department code must be uppercase alphanumeric'),
  
  body('managerId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Manager User ID format');
      }
      return true;
    }),
  
  body('parentDepartmentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Parent Department ID format');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
];

module.exports = {
  createDepartmentValidator,
  updateDepartmentValidator
};
