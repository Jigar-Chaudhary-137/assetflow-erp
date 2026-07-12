const { body } = require('express-validator');
const mongoose = require('mongoose');

const createBookingValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Asset ID format');
      }
      return true;
    }),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .custom((value) => {
      const start = new Date(value);
      if (isNaN(start.getTime())) {
        throw new Error('Invalid start date format');
      }
      if (start < new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .custom((value, { req }) => {
      const end = new Date(value);
      if (isNaN(end.getTime())) {
        throw new Error('Invalid end date format');
      }
      if (req.body.startDate) {
        const start = new Date(req.body.startDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('purpose')
    .notEmpty().withMessage('Purpose is required')
    .trim()
    .isLength({ min: 3, max: 500 }).withMessage('Purpose must be between 3 and 500 characters'),

  body('notes')
    .optional({ nullable: true })
    .trim()
];

const updateBookingStatusValidator = [
  body('reason')
    .optional({ nullable: true })
    .trim()
];

module.exports = {
  createBookingValidator,
  updateBookingStatusValidator
};
