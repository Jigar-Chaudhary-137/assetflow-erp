const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  
  body('code')
    .trim()
    .notEmpty().withMessage('Category code is required')
    .isLength({ min: 2, max: 5 }).withMessage('Category code must be between 2 and 5 characters')
    .toUpperCase()
    .matches(/^[A-Z0-9]+$/).withMessage('Category code must be uppercase alphanumeric'),
  
  body('description')
    .optional({ nullable: true })
    .trim(),
  
  body('customFields')
    .optional()
    .isArray().withMessage('Custom fields must be an array'),

  body('customFields.*.fieldName')
    .trim()
    .notEmpty().withMessage('Custom field name is required')
    .matches(/^[a-z][a-zA-Z0-9]*$/).withMessage('Custom field name must be camelCase'),

  body('customFields.*.label')
    .trim()
    .notEmpty().withMessage('Custom field label is required'),

  body('customFields.*.fieldType')
    .trim()
    .notEmpty().withMessage('Custom field type is required')
    .isIn(['STRING', 'NUMBER', 'BOOLEAN', 'DATE']).withMessage('Field type must be STRING, NUMBER, BOOLEAN, or DATE'),

  body('customFields.*.required')
    .optional()
    .isBoolean().withMessage('Required must be a boolean value'),

  body('customFields.*.description')
    .optional({ nullable: true })
    .trim()
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 }).withMessage('Category code must be between 2 and 5 characters')
    .toUpperCase()
    .matches(/^[A-Z0-9]+$/).withMessage('Category code must be uppercase alphanumeric'),
  
  body('description')
    .optional({ nullable: true })
    .trim(),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  
  body('customFields')
    .optional()
    .isArray().withMessage('Custom fields must be an array'),

  body('customFields.*.fieldName')
    .trim()
    .notEmpty().withMessage('Custom field name is required')
    .matches(/^[a-z][a-zA-Z0-9]*$/).withMessage('Custom field name must be camelCase'),

  body('customFields.*.label')
    .trim()
    .notEmpty().withMessage('Custom field label is required'),

  body('customFields.*.fieldType')
    .trim()
    .notEmpty().withMessage('Custom field type is required')
    .isIn(['STRING', 'NUMBER', 'BOOLEAN', 'DATE']).withMessage('Field type must be STRING, NUMBER, BOOLEAN, or DATE'),

  body('customFields.*.required')
    .optional()
    .isBoolean().withMessage('Required must be a boolean value'),

  body('customFields.*.description')
    .optional({ nullable: true })
    .trim()
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator
};
