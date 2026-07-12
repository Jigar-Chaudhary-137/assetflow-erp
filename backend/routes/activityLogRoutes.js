const express = require('express');
const { 
  getActivityLogs, 
  getActivityLogById 
} = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/', protect, authorize('Admin', 'Manager'), getActivityLogs);
router.get('/:id', protect, authorize('Admin', 'Manager'), getActivityLogById);

module.exports = router;
