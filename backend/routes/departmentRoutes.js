const express = require('express');
const { 
  createDepartment, 
  getDepartments, 
  getDepartmentById, 
  updateDepartment, 
  deleteDepartment 
} = require('../controllers/departmentController');
const { 
  createDepartmentValidator, 
  updateDepartmentValidator 
} = require('../validations/departmentValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createDepartmentValidator, validate, createDepartment);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getDepartments);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getDepartmentById);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateDepartmentValidator, validate, updateDepartment);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteDepartment);

module.exports = router;
