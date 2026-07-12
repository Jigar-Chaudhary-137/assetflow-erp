const mongoose = require('mongoose');

const auditLocationSchema = new mongoose.Schema({
  building: {
    type: String,
    required: [true, 'Building is required'],
    trim: true
  },
  floor: {
    type: Number,
    default: null
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true
  }
}, { _id: false });

const verifiedAssetSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  verifiedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  verifiedCondition: {
    type: String,
    required: true,
    enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']
  },
  verifiedLocation: {
    type: auditLocationSchema,
    required: [true, 'Verified location is required']
  },
  notes: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

const missingAssetSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  reportedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

const damagedAssetSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  reportedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  damageDescription: {
    type: String,
    required: [true, 'Damage description is required'],
    trim: true,
    minlength: [5, 'Damage description must be at least 5 characters'],
    maxlength: [500, 'Damage description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

const auditSchema = new mongoose.Schema({
  auditCycleName: {
    type: String,
    required: [true, 'Audit cycle name is required'],
    trim: true,
    minlength: [3, 'Audit cycle name must be at least 3 characters'],
    maxlength: [100, 'Audit cycle name cannot exceed 100 characters']
  },
  auditorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Auditor reference is required']
  },
  status: {
    type: String,
    required: true,
    enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED'],
    default: 'PLANNED'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    default: null
  },
  targetDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  targetCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  verifiedAssets: {
    type: [verifiedAssetSchema],
    default: []
  },
  missingAssets: {
    type: [missingAssetSchema],
    default: []
  },
  damagedAssets: {
    type: [damagedAssetSchema],
    default: []
  }
}, {
  timestamps: true
});

// Indexes
auditSchema.index({ auditorId: 1 });
auditSchema.index({ status: 1 });
auditSchema.index({ startDate: -1 });

module.exports = mongoose.model('Audit', auditSchema);
