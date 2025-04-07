// server/models/FacultyProfile.js
const mongoose = require('mongoose');

const facultyProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true // One profile per faculty user
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    subjects: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        trim: true,
        default: [],
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true
    },
    joiningYear: {
        type: Number,
        required: [true, 'Joining year is required'],
        min: [1900, 'Joining year seems too early'],
        max: [new Date().getFullYear(), 'Joining year cannot be in the future']
    },
    qualifications: {
        type: [String], // Array of strings
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);