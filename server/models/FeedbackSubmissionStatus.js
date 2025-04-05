// server/models/FeedbackSubmissionStatus.js

const mongoose = require('mongoose');

const feedbackSubmissionStatusSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Link to the 'User' model (representing the student)
    required: true, // Student is required
  },
  teachingAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeachingAssignment', // Link to the 'TeachingAssignment' model
    required: true, // Teaching assignment is required
  },
  submitted: {
    type: Boolean,
    default: false, // Indicates whether the student has submitted feedback
  },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Ensure uniqueness on the combination of student and teachingAssignment
feedbackSubmissionStatusSchema.index(
  { student: 1, teachingAssignment: 1 },
  { unique: true }
);

// Model export
module.exports = mongoose.model('FeedbackSubmissionStatus', feedbackSubmissionStatusSchema);
