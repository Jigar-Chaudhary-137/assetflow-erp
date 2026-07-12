const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: [true, 'Field name identifier is required'],
    trim: true,
    match: [/^[a-z][a-zA-Z0-9]*$/, 'Field name must be in camelCase format']
  },
  label: {
    type: String,
    required: [true, 'Display label is required'],
    trim: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'DATE']
  },
  required: {
    type: Boolean,
    required: true,
    default: false
  },
  description: {
    type: String,
    default: null,
    trim: true
  }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  code: {
    type: String,
    required: [true, 'Category code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [2, 'Category code must be at least 2 characters'],
    maxlength: [5, 'Category code cannot exceed 5 characters'],
    match: [/^[A-Z0-9]+$/, 'Category code must be uppercase alphanumeric']
  },
  description: {
    type: String,
    default: null,
    trim: true
  },
  customFields: {
    type: [customFieldSchema],
    default: []
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

<<<<<<< HEAD
=======
// Indexes


>>>>>>> afc2239 (Connect frontend with backend)
module.exports = mongoose.model('Category', categorySchema);
