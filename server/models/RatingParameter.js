// server/models/RatingParameter.js

const mongoose = require('mongoose');

const ratingParameterSchema = new mongoose.Schema({
  parameterId: {
    type: String,
    required: true, // The parameter ID is required (e.g., "KNOWLEDGE")
    unique: true, // Ensure the parameter ID is unique across the collection
  },
  questionText: {
    type: String,
    required: true, // The question text is required (e.g., "Rate the faculty's subject knowledge.")
  },
  order: {
    type: Number,
    default: 0, // Default order for display, useful for sorting questions
  },
  isActive: {
    type: Boolean,
    default: true, // The parameter is active by default
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation timestamp
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set the updated timestamp
  },
});

// Model export
module.exports = mongoose.model('RatingParameter', ratingParameterSchema);
