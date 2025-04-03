// server/models/Subject.js

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true, // Ensures the subject code is unique across all subjects
  },
  subjectName: {
    type: String,
    required: true, // Subject name is required
  },
  branch: {
    type: String,
    required: true, // Branch is required
  },
  semester: {
    type: Number,
    required: true, // Semester is required (e.g., 1, 2, 3)
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default to the current date and time when created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Default to the current date and time when created
  },
});

// Model export
module.exports = mongoose.model('Subject', subjectSchema);
