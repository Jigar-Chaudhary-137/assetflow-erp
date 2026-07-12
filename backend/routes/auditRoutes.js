const express = require('express');
const { 
  createAuditCycle, 
  startAudit, 
  verifyAsset, 
  completeAudit, 
  getAudits, 
  getAuditById 
} = require('../controllers/auditController');
const { 
  createAuditValidator, 
  verifyAssetValidator 
} = require('../validations/auditValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createAuditValidator, validate, createAuditCycle);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getAudits);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getAuditById);
router.patch('/:id/start', protect, authorize('Admin', 'Manager'), startAudit);
router.patch('/:id/verify', protect, authorize('Admin', 'Manager', 'Staff'), verifyAssetValidator, validate, verifyAsset);
router.patch('/:id/complete', protect, authorize('Admin', 'Manager'), completeAudit);

module.exports = router;
