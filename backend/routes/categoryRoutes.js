const express = require('express');
const { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { 
  createCategoryValidator, 
  updateCategoryValidator 
} = require('../validations/categoryValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createCategoryValidator, validate, createCategory);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getCategories);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getCategoryById);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateCategoryValidator, validate, updateCategory);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteCategory);

module.exports = router;
