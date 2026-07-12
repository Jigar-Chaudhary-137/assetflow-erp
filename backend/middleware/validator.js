const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    field: err.path || err.param,
    message: err.msg
  }));

  return res.status(422).json({
    success: false,
    error: 'Validation Error',
    details: extractedErrors
  });
};

module.exports = validate;
