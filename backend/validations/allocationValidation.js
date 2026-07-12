const { body } = require('express-validator');
const mongoose = require('mongoose');

const createAllocationValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Asset ID format');
      }
      return true;
    }),
  
  body('employeeId')
    .notEmpty().withMessage('Employee (User) ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Employee ID format');
      }
      return true;
    }),

  body('expectedReturnDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value) {
        const parsedDate = Date.parse(value);
        if (isNaN(parsedDate)) {
          throw new Error('Invalid Expected Return Date');
        }
        if (new Date(parsedDate) <= new Date()) {
          throw new Error('Expected return date must be in the future');
        }
      }
      return true;
    }),

  body('notes')
    .optional({ nullable: true })
    .trim()
];

const returnAllocationValidator = [
  body('notes')
    .optional({ nullable: true })
    .trim()
];

module.exports = {
  createAllocationValidator,
  returnAllocationValidator
};
