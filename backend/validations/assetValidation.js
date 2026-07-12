const { body } = require('express-validator');
const mongoose = require('mongoose');

const createAssetValidator = [
  body('assetTag')
    .trim()
    .notEmpty().withMessage('Asset tag is required')
    .toUpperCase(),
  
  body('serialNumber')
    .trim()
    .notEmpty().withMessage('Serial number is required')
    .isLength({ min: 3, max: 100 }).withMessage('Serial number must be between 3 and 100 characters'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('Asset name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Asset name must be between 2 and 100 characters'),
  
  body('categoryId')
    .notEmpty().withMessage('Category reference is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Category ID format');
      }
      return true;
    }),
  
  body('condition')
    .optional()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Invalid condition value'),

  body('location')
    .notEmpty().withMessage('Location details are required')
    .isObject().withMessage('Location must be an object'),

  body('location.building')
    .trim()
    .notEmpty().withMessage('Location building is required'),

  body('location.floor')
    .optional({ nullable: true })
    .isInt().withMessage('Location floor must be an integer'),

  body('location.room')
    .trim()
    .notEmpty().withMessage('Location room is required'),

  body('departmentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Department ID format');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn([
      'AVAILABLE',
      'ALLOCATED',
      'RESERVED',
      'UNDER_MAINTENANCE',
      'LOST',
      'RETIRED',
      'DISPOSED'
    ]).withMessage('Invalid status value'),

  body('bookable')
    .optional()
    .isBoolean().withMessage('Bookable must be a boolean value'),

  body('specs')
    .optional()
    .isObject().withMessage('Specs must be a key-value object'),

  body('purchaseInfo')
    .optional({ nullable: true })
    .isObject().withMessage('Purchase info must be an object'),

  body('purchaseInfo.purchaseDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))) {
        throw new Error('Invalid purchase date');
      }
      return true;
    }),

  body('purchaseInfo.purchaseCost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Purchase cost cannot be negative'),

  body('purchaseInfo.vendor')
    .optional({ nullable: true })
    .trim(),

  body('purchaseInfo.warrantyExpiration')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))) {
        throw new Error('Invalid warranty expiration date');
      }
      return true;
    })
];

const updateAssetValidator = [
  body('assetTag')
    .optional()
    .trim()
    .toUpperCase(),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Serial number must be between 3 and 100 characters'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Asset name must be between 2 and 100 characters'),
  
  body('categoryId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Category ID format');
      }
      return true;
    }),
  
  body('condition')
    .optional()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Invalid condition value'),

  body('location')
    .optional()
    .isObject().withMessage('Location must be an object'),

  body('location.building')
    .optional()
    .trim()
    .notEmpty().withMessage('Location building cannot be empty'),

  body('location.floor')
    .optional({ nullable: true })
    .isInt().withMessage('Location floor must be an integer'),

  body('location.room')
    .optional()
    .trim()
    .notEmpty().withMessage('Location room cannot be empty'),

  body('departmentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Department ID format');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn([
      'AVAILABLE',
      'ALLOCATED',
      'RESERVED',
      'UNDER_MAINTENANCE',
      'LOST',
      'RETIRED',
      'DISPOSED'
    ]).withMessage('Invalid status value'),

  body('bookable')
    .optional()
    .isBoolean().withMessage('Bookable must be a boolean value'),

  body('specs')
    .optional()
    .isObject().withMessage('Specs must be a key-value object'),

  body('purchaseInfo')
    .optional({ nullable: true })
    .isObject().withMessage('Purchase info must be an object'),

  body('purchaseInfo.purchaseDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))) {
        throw new Error('Invalid purchase date');
      }
      return true;
    }),

  body('purchaseInfo.purchaseCost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Purchase cost cannot be negative'),

  body('purchaseInfo.vendor')
    .optional({ nullable: true })
    .trim(),

  body('purchaseInfo.warrantyExpiration')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))) {
        throw new Error('Invalid warranty expiration date');
      }
      return true;
    })
];

module.exports = {
  createAssetValidator,
  updateAssetValidator
};
