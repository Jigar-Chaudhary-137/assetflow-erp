const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee reference is required']
  },
  allocatedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Allocated by user reference is required']
  },
  allocatedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    default: null
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'RETURNED', 'TRANSFERRED'],
    default: 'ACTIVE'
  },
  transferStatus: {
    type: String,
    required: true,
    enum: ['NONE', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
    default: 'NONE'
  },
  transferRequestedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
allocationSchema.index({ assetId: 1 });
allocationSchema.index({ employeeId: 1 });
allocationSchema.index({ transferStatus: 1 });

// Critical partial unique index to prevent double allocation of the same asset
allocationSchema.index(
  { assetId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'ACTIVE' },
    name: 'idx_allocations_active_unique'
  }
);

module.exports = mongoose.model('Allocation', allocationSchema);
