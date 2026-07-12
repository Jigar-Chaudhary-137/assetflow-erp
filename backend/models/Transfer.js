const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset is required']
  },
  allocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allocation',
    required: [true, 'Allocation is required']
  },
  fromEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'From Employee is required']
  },
  toEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'To Employee is required']
  },
  requestedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by is required']
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  comments: {
    type: String,
    trim: true,
    default: null
  },
  actionDate: {
    type: Date,
    default: null
  },
  actionById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
transferSchema.index({ assetId: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ fromEmployeeId: 1 });
transferSchema.index({ toEmployeeId: 1 });

module.exports = mongoose.model('Transfer', transferSchema);
