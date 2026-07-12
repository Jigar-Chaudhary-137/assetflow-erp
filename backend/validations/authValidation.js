const { body } = require("express-validator");
const mongoose = require("mongoose");

const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("name").trim().notEmpty().withMessage("Name is required"),

  body("role")
    .optional()
    .isIn(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"])
    .withMessage("Invalid role value"),

  body("departmentId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Department ID");
      }
      return true;
    }),

  body("contactNumber").optional({ nullable: true }).trim(),
];

const loginValidator = [
  body("email").trim().notEmpty().withMessage("Email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

const refreshValidator = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshValidator,
};
