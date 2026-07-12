const { body } = require("express-validator");
const mongoose = require("mongoose");

const createBookingValidator = [
  body("resourceId")
    .notEmpty()
    .withMessage("Resource (Asset) ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Resource ID format");
      }
      return true;
    }),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .custom((value) => {
      const parsedDate = Date.parse(value);
      if (isNaN(parsedDate)) {
        throw new Error("Invalid Start Time");
      }
      if (new Date(parsedDate) <= new Date()) {
        throw new Error("Start time must be in the future");
      }
      return true;
    }),

  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .custom((value, { req }) => {
      const parsedEnd = Date.parse(value);
      if (isNaN(parsedEnd)) {
        throw new Error("Invalid End Time");
      }

      const parsedStart = Date.parse(req.body.startTime);
      if (isNaN(parsedStart)) {
        // Handled by startTime validator, but prevent crash here
        return true;
      }

      const startTime = new Date(parsedStart);
      const endTime = new Date(parsedEnd);

      if (endTime <= startTime) {
        throw new Error("End time must be strictly greater than start time");
      }

      // Max duration limit check: 24 hours
      const diffMs = endTime - startTime;
      const hours = diffMs / (1000 * 60 * 60);
      if (hours > 24) {
        throw new Error("Booking duration must not exceed 24 hours");
      }

      return true;
    }),

  body("purpose")
    .notEmpty()
    .withMessage("Purpose is required")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Purpose must be between 5 and 200 characters"),
];

module.exports = {
  createBookingValidator,
};
