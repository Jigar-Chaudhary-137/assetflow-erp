const express = require('express');
const { 
  allocateAsset, 
  returnAsset, 
  getActiveAllocations, 
  getAllAllocations, 
  getAllocationById 
} = require('../controllers/allocationController');
const { 
  createAllocationValidator, 
  returnAllocationValidator 
} = require('../validations/allocationValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createAllocationValidator, validate, allocateAsset);
router.post('/:id/return', protect, authorize('Admin', 'Manager'), returnAllocationValidator, validate, returnAsset);
router.get('/active', protect, authorize('Admin', 'Manager', 'Staff'), getActiveAllocations);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getAllAllocations);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getAllocationById);

module.exports = router;
