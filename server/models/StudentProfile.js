// server/models/StudentProfile.js

const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the 'User' model
    required: true, // The user is required
    unique: true, // Ensure each student profile is linked to only one user
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class', // Reference to the 'Class' model
    required: true, // The class is required
  },
  admissionYear: {
    type: Number,
    required: true, // Admission year is required (e.g., 2020)
  },
  status: {
    type: String,
    enum: ['active', 'graduated', 'inactive', 'dropped'], // Status can be 'active', 'graduated', 'inactive', or 'dropped'
    default: 'active', // Default status is 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default to the current date and time when the document is created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Default to the current date and time when the document is created
  },
});

// Model export
module.exports = mongoose.model('StudentProfile', studentProfileSchema);
