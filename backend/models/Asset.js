const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
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

const purchaseInfoSchema = new mongoose.Schema({
  purchaseDate: {
    type: Date,
    default: null
  },
  purchaseCost: {
    type: Number,
    min: [0, 'Purchase cost cannot be negative'],
    default: null
  },
  vendor: {
    type: String,
    trim: true,
    default: null
  },
  warrantyExpiration: {
    type: Date,
    default: null
  }
}, { _id: false });

const historySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  action: {
    type: String,
    required: true,
    enum: [
      'REGISTERED',
      'ALLOCATED',
      'RETURNED',
      'TRANSFERRED',
      'MAINTENANCE_REQUESTED',
      'MAINTENANCE_COMPLETED',
      'LOST_REPORTED',
      'STATUS_CHANGED'
    ]
  },
  performedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

const assetSchema = new mongoose.Schema({
  assetTag: {
    type: String,
    required: [true, 'Asset tag is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Serial number must be at least 3 characters'],
    maxlength: [100, 'Serial number cannot exceed 100 characters']
  },
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    minlength: [2, 'Asset name must be at least 2 characters'],
    maxlength: [100, 'Asset name cannot exceed 100 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category reference is required']
  },
  condition: {
    type: String,
    required: true,
    enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'],
    default: 'NEW'
  },
  location: {
    type: locationSchema,
    required: [true, 'Location details are required']
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: [
      'AVAILABLE',
      'ALLOCATED',
      'RESERVED',
      'UNDER_MAINTENANCE',
      'LOST',
      'RETIRED',
      'DISPOSED'
    ],
    default: 'AVAILABLE'
  },
  bookable: {
    type: Boolean,
    required: true,
    default: false
  },
  specs: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  purchaseInfo: {
    type: purchaseInfoSchema,
    default: null
  },
  history: {
    type: [historySchema],
    default: []
  }
}, {
  timestamps: true
});

// Indexes
assetSchema.index({ assetTag: 1 });
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ categoryId: 1 });
assetSchema.index({ departmentId: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ bookable: 1 });

module.exports = mongoose.model('Asset', assetSchema);
