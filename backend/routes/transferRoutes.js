const express = require('express');
const { 
  createTransferRequest, 
  approveTransfer, 
  rejectTransfer, 
  getTransfers, 
  getTransferById 
} = require('../controllers/transferController');
const { 
  createTransferValidator, 
  rejectTransferValidator 
} = require('../validations/transferValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager', 'Staff'), createTransferValidator, validate, createTransferRequest);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getTransfers);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getTransferById);
router.patch('/:id/approve', protect, authorize('Admin', 'Manager'), approveTransfer);
router.patch('/:id/reject', protect, authorize('Admin', 'Manager'), rejectTransferValidator, validate, rejectTransfer);

module.exports = router;
