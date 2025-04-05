// server/models/StudentProfile.js

const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the 'User' model
    required: true, // The user is required
    unique: true, // Ensure each student profile is linked to only one user
  },
  branch: {
    type: String,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'], // Branch can be one of these values
    required: true
  },
  semester: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8], // Semester can be one of these values
    required: true // Semester is required
  },
  section: {
    type: String,
    enum: ['A', 'B', 'C'], // Section can be one of these values
    required: true 
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class', // Reference to the 'Class' model
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
  pendingMapping: {
    type: Boolean,
    default: true, // Default to false (no pending mapping)
  }},{timestamps: true}); // Automatically manage createdAt and updatedAt fields

// Model export
module.exports = mongoose.model('StudentProfile', studentProfileSchema);
