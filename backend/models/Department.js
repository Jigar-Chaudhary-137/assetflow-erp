const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Department name must be at least 2 characters'],
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [2, 'Department code must be at least 2 characters'],
    maxlength: [10, 'Department code cannot exceed 10 characters'],
    match: [/^[A-Z0-9]+$/, 'Department code must be uppercase alphanumeric']
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  parentDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Indexes

departmentSchema.index({ managerId: 1 });
departmentSchema.index({ parentDepartmentId: 1 });

module.exports = mongoose.model('Department', departmentSchema);
