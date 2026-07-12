const { body } = require('express-validator');
const mongoose = require('mongoose');

const createMaintenanceValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Asset ID format');
      }
      return true;
    }),
  
  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .custom((value) => {
      if (isNaN(Date.parse(value))) {
        throw new Error('Invalid scheduled date format');
      }
      return true;
    }),

  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']).withMessage('Invalid priority value'),

  body('issueDescription')
    .notEmpty().withMessage('Issue description is required')
    .isLength({ min: 5, max: 500 }).withMessage('Issue description must be between 5 and 500 characters'),

  body('estimatedCost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Estimated cost cannot be negative'),

  body('vendor')
    .optional({ nullable: true })
    .trim(),

  body('notes')
    .optional({ nullable: true })
    .trim()
];

const completeMaintenanceValidator = [
  body('resolutionDetails')
    .notEmpty().withMessage('Resolution details are required')
    .isLength({ min: 5 }).withMessage('Resolution details must be at least 5 characters'),

  body('actualCost')
    .notEmpty().withMessage('Actual cost is required')
    .isFloat({ min: 0 }).withMessage('Actual cost cannot be negative'),

  body('vendor')
    .optional({ nullable: true })
    .trim()
];

module.exports = {
  createMaintenanceValidator,
  completeMaintenanceValidator
};
