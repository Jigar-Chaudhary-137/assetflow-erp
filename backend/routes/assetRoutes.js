const express = require('express');
const { 
  createAsset, 
  getAssets, 
  getAssetById, 
  updateAsset, 
  deleteAsset 
} = require('../controllers/assetController');
const { 
  createAssetValidator, 
  updateAssetValidator 
} = require('../validations/assetValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, authorize('Admin', 'Manager'), createAssetValidator, validate, createAsset);
router.get('/', protect, authorize('Admin', 'Manager', 'Staff'), getAssets);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Staff'), getAssetById);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateAssetValidator, validate, updateAsset);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteAsset);

module.exports = router;
