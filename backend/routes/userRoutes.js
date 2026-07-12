const express = require('express');
const { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  patchUserStatus
} = require('../controllers/userController');
const { 
  updateUserValidator 
} = require('../validations/userValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getUsers);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getUserById);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateUserValidator, validate, updateUser);
router.patch('/:id/status', protect, authorize('Admin', 'Manager'), patchUserStatus);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteUser);

module.exports = router;
