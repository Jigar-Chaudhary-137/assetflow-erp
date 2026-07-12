const { body } = require('express-validator');
const mongoose = require('mongoose');

const createTransferValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Asset ID format');
      }
      return true;
    }),

  body('toEmployeeId')
    .notEmpty().withMessage('Destination Employee (User) ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Destination User ID format');
      }
      return true;
    }),

  body('comments')
    .optional({ nullable: true })
    .trim()
];

const rejectTransferValidator = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ min: 3, max: 200 }).withMessage('Rejection reason must be between 3 and 200 characters')
];

module.exports = {
  createTransferValidator,
  rejectTransferValidator
};
