const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    teachingAssignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeachingAssignment',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Linking to User (student) for duplicate checking, but should be handled carefully for anonymity
        required: true,
    },
    ratings: [{
        ratingParameter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RatingParameter',
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    }],
    comment: {
        type: String,
        trim: true,
        maxlength: 1000, // Limit comment length
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a student can only submit once per teaching assignment
feedbackSchema.index({ teachingAssignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
