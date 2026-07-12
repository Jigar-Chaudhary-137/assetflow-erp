const express = require('express');
const { 
  registerUser, 
  loginUser, 
  refreshTokens, 
  logoutUser, 
  getCurrentUser 
} = require('../controllers/authController');
const { 
  registerValidator, 
  loginValidator, 
  refreshValidator 
} = require('../validations/authValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.post('/refresh', refreshValidator, validate, refreshTokens);
router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;
