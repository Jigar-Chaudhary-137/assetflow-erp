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
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.post('/refresh', refreshValidator, validate, refreshTokens);
router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser);

// RBAC test routes
router.get('/admin-only', protect, authorize('Admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin' });
});

router.get('/manager-only', protect, authorize('Manager'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Manager' });
});

router.get('/staff-only', protect, authorize('Staff'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Staff' });
});

module.exports = router;
