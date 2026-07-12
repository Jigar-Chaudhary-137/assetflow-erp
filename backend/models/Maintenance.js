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
    minlength: [10, 'Issue description must be at least 10 characters'],
    maxlength: [500, 'Issue description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
    default: 'PENDING'
  },
  approvedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  maintenanceType: {
    type: String,
    required: true,
    enum: ['PREVENTIVE', 'CORRECTIVE'],
    default: 'CORRECTIVE'
  },
  scheduledDate: {
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
  cost: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Cost cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes
maintenanceSchema.index({ assetId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ technicianId: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
