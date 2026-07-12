const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  reportedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reported by user reference is required']
  },
  reportedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  issueDescription: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    minlength: [5, 'Issue description must be at least 5 characters'],
    maxlength: [500, 'Issue description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY'],
    default: 'LOW'
  },
  status: {
    type: String,
    required: true,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startedAt: {
    type: Date,
    default: null
  },
  completionDate: {
    type: Date,
    default: null
  },
  resolutionDetails: {
    type: String,
    trim: true,
    default: null
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative'],
    default: 0
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
    default: 0
  },
  vendor: {
    type: String,
    trim: true,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
maintenanceSchema.index({ assetId: 1 });
maintenanceSchema.index({ status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
