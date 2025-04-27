// server/models/AggregatedRating.js

const mongoose = require('mongoose');

const aggregatedRatingSchema = new mongoose.Schema({
  teachingAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeachingAssignment',
    required: [true, 'Teaching assignment is required'],
  },
  ratingParameter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RatingParameter',
    required: [true, 'Rating parameter is required'],
  },
  totalResponses: {
    type: Number,
    required: [true, 'Total responses is required'],
    min: [0, 'Total responses cannot be negative'],
  },
  ratingSum: {
    type: Number,
    required: [true, 'Rating sum is required'],
    min: [0, 'Rating sum cannot be negative'],
  },
  averageRating: {
    type: Number,
    required: [true, 'Average rating is required'],
    min: [1, 'Average rating must be at least 1'],
    max: [5, 'Average rating cannot exceed 5'],
  },
});

// Unique index to ensure one rating per teaching assignment and parameter
aggregatedRatingSchema.index(
  { teachingAssignment: 1, ratingParameter: 1 },
  { unique: true }
);

// Index for efficient querying by teaching assignment
aggregatedRatingSchema.index({ teachingAssignment: 1 });

const AggregatedRating = mongoose.model('AggregatedRating', aggregatedRatingSchema);

module.exports = AggregatedRating;