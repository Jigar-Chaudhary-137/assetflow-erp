const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset reference is required']
  },
  bookedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booked by user reference is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    minlength: [3, 'Purpose must be at least 3 characters'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING'
  },
  approvedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
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
bookingSchema.index({ assetId: 1 });
bookingSchema.index({ bookedById: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
