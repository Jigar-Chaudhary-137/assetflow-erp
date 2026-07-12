const express = require('express');
const { 
  createMaintenanceRequest, 
  startMaintenance, 
  completeMaintenance, 
  cancelMaintenance, 
  getMaintenanceList, 
  getMaintenanceById 
} = require('../controllers/maintenanceController');
const { 
  createMaintenanceValidator, 
  completeMaintenanceValidator 
} = require('../validations/maintenanceValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createMaintenanceValidator, validate, createMaintenanceRequest);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getMaintenanceList);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getMaintenanceById);
router.patch('/:id/start', protect, authorize('Admin', 'Manager'), startMaintenance);
router.patch('/:id/complete', protect, authorize('Admin', 'Manager'), completeMaintenanceValidator, validate, completeMaintenance);
router.patch('/:id/cancel', protect, authorize('Admin', 'Manager'), cancelMaintenance);

module.exports = router;
