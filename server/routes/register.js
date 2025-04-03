// server/routes/register.js
const express = require('express');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');

const router = express.Router();

// POST /api/auth/register
router.post('/', async (req, res) => {
    try {
        const { 
            userId, 
            name, 
            email, 
            password, 
            role, 
            class: classId, 
            admissionYear, 
            department, 
            designation, 
            joiningYear, 
            qualifications 
        } = req.body;

        // Common validation
        if (!userId || !name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields: userId, name, email, password, role' });
        }

        // Role-specific validation
        if (role === 'student' && (!classId || !admissionYear)) {
            return res.status(400).json({ message: 'Students require class and admissionYear' });
        }
        if (role === 'faculty' && (!department || !designation || !joiningYear)) {
            return res.status(400).json({ message: 'Faculty require department, designation, and joiningYear' });
        }
        if (!['student', 'faculty', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be student, faculty, or admin' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID or Email already exists' });
        }

        // Create user
        const newUser = new User({ userId, name, email, password, role });
        const savedUser = await newUser.save();

        // Create role-specific profile
        if (role === 'student') {
            await StudentProfile.create({
                user: savedUser._id,
                class: classId,
                admissionYear
            });
        } else if (role === 'faculty') {
            await FacultyProfile.create({
                user: savedUser._id,
                department,
                designation,
                joiningYear,
                qualifications: qualifications || []
            });
        }

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: savedUser._id,
                userId: savedUser.userId,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

module.exports = router;