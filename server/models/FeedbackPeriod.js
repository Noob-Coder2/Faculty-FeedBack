// server/models/FeedbackPeriod.js

const mongoose = require('mongoose');

const feedbackPeriodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Fall 2025 Feedback"
  },
  semester: {
    type: Number,
    required: true, // Semester number (e.g., 1 for Fall, 2 for Spring)
  },
  year: {
    type: Number,
    required: true, // Year (e.g., 2025)
  },
  startDate: {
    type: Date,
    required: true, // The start date of the feedback period
  },
  endDate: {
    type: Date,
    required: true, // The end date of the feedback period
  },
  isActive: {
    type: Boolean,
    default: false, // Determines if the feedback period is active or not, can be toggled by admin
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed'], // The status of the feedback period
    default: 'upcoming', // Default to 'upcoming'
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
module.exports = mongoose.model('FeedbackPeriod', feedbackPeriodSchema);
