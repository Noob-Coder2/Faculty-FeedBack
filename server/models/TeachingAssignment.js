// server/models/TeachingAssignment.js
const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    feedbackPeriod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeedbackPeriod',
        required: true
    },
}, { timestamps: true });

teachingAssignmentSchema.index({ faculty: 1, subject: 1, class: 1, feedbackPeriod: 1 }, { unique: true });

module.exports = mongoose.model('TeachingAssignment', teachingAssignmentSchema);