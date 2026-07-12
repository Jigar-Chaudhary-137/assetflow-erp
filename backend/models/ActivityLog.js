const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  action: {
    type: String,
    required: [true, 'Action verb is required'],
    trim: true
  },
  module: {
    type: String,
    required: true,
    enum: [
      'AUTH',
      'USER',
      'DEPARTMENT',
      'CATEGORY',
      'ASSET',
      'ALLOCATION',
      'BOOKING',
      'MAINTENANCE',
      'AUDIT'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
