const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver reference is required']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'ALLOCATION',
      'TRANSFER_REQUEST',
      'MAINTENANCE_ALERT',
      'BOOKING_CONFIRMATION',
      'AUDIT_ALERT',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message body is required'],
    trim: true
  },
  readStatus: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedEntityType: {
    type: String,
    enum: ['Asset', 'Allocation', 'Booking', 'Maintenance', 'Audit'],
    default: null
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ receiverId: 1, readStatus: 1 }, { name: 'idx_notifications_receiver_unread' });
notificationSchema.index({ receiverId: 1, createdAt: -1 }, { name: 'idx_notifications_receiver_time' });

module.exports = mongoose.model('Notification', notificationSchema);
