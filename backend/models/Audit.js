const mongoose = require('mongoose');

const verifiedAssetSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  found: {
    type: Boolean,
    required: [true, 'Found status is required']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['GOOD', 'DAMAGED', 'MISSING']
  },
  remarks: {
    type: String,
    trim: true,
    default: null
  },
  verifiedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: false });

const auditSchema = new mongoose.Schema({
  auditCode: {
    type: String,
    required: [true, 'Audit code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  auditName: {
    type: String,
    required: [true, 'Audit name is required'],
    trim: true
  },
  auditType: {
    type: String,
    trim: true,
    default: null
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  auditorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Auditor reference is required']
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
  location: {
    type: String,
    trim: true,
    default: null
  },
  scope: {
    type: String,
    trim: true,
    default: null
  },
  remarks: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  selectedAssets: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    }],
    default: []
  },
  verifiedAssets: {
    type: [verifiedAssetSchema],
    default: []
  },
  summary: {
    totalAudited: { type: Number, default: 0 },
    found: { type: Number, default: 0 },
    missing: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
<<<<<<< HEAD
=======

>>>>>>> afc2239 (Connect frontend with backend)
auditSchema.index({ auditorId: 1 });
auditSchema.index({ status: 1 });

module.exports = mongoose.model('Audit', auditSchema);
