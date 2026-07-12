const { body } = require('express-validator');
const mongoose = require('mongoose');

const createAuditValidator = [
  body('auditCode')
    .trim()
    .notEmpty().withMessage('Audit code is required')
    .toUpperCase(),

  body('auditName')
    .trim()
    .notEmpty().withMessage('Audit name is required'),

  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .custom((value) => {
      if (isNaN(Date.parse(value))) {
        throw new Error('Invalid scheduled date format');
      }
      return true;
    }),

  body('auditorId')
    .notEmpty().withMessage('Auditor reference ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Auditor User ID format');
      }
      return true;
    }),

  body('targetDepartmentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid target Department ID format');
      }
      return true;
    }),

  body('targetCategoryId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid target Category ID format');
      }
      return true;
    }),

  body('selectedAssets')
    .optional()
    .isArray().withMessage('Selected assets must be an array of asset IDs')
    .custom((value) => {
      if (value) {
        for (const id of value) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid Asset ID format in selectedAssets array: ${id}`);
          }
        }
      }
      return true;
    })
];

const verifyAssetValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Asset ID format');
      }
      return true;
    }),

  body('found')
    .notEmpty().withMessage('Found status is required')
    .isBoolean().withMessage('Found status must be a boolean (true/false)'),

  body('condition')
    .notEmpty().withMessage('Condition status is required')
    .isIn(['GOOD', 'DAMAGED', 'MISSING']).withMessage('Condition status must be GOOD, DAMAGED, or MISSING'),

  body('remarks')
    .optional({ nullable: true })
    .trim()
];

module.exports = {
  createAuditValidator,
  verifyAssetValidator
};
