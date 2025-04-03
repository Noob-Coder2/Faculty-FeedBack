// server/models/Class.js

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Class name is required'],
        trim: true
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        trim: true
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [2000, 'Year must be after 2000'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    section: {
        type: String,
        required: [true, 'Section is required'],
        trim: true
    },
    academicYear: {
        type: String, // e.g., "2023-2024"
        required: [true, 'Academic Year is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Class', classSchema);
