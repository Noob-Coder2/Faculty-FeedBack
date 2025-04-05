// server/models/AggregatedRating.js

const mongoose = require('mongoose');

const aggregatedRatingSchema = new mongoose.Schema({
  teachingAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeachingAssignment', // Link to the TeachingAssignment model
    required: true, // Teaching assignment is required
  },
  ratingParameter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RatingParameter', // Link to the RatingParameter model
    required: true, // Rating parameter is required
  },
  totalResponses: {
    type: Number,
    default: 0, // Default value for total responses
  },
  ratingSum: {
    type: Number,
    default: 0, // Sum of all ratings received for this parameter
  },
  averageRating: {
    type: Number,
    default: 0, // Calculated average rating based on total responses and rating sum
  }
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Ensure uniqueness on the combination of teachingAssignment and ratingParameter
aggregatedRatingSchema.index(
  { teachingAssignment: 1, ratingParameter: 1 },
  { unique: true }
);

// Model export
module.exports = mongoose.model('AggregatedRating', aggregatedRatingSchema);
