// server/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');

// POST /api/admin/users - Create a new user (admin only)
router.post('/users', async (req, res) => {
    try {
        const { 
            userId, 
            name, 
            email, 
            password, 
            role, 
            class: classId, // For students
            admissionYear,  // For students
            department,     // For faculty
            designation,    // For faculty
            joiningYear,    // For faculty
            qualifications  // For faculty
        } = req.body;

        // Basic validation
        if (!userId || !name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields: userId, name, email, password, role' });
        }

        // Role-specific validation (optional for admin route)
        if (role === 'student' && (!classId || !admissionYear)) {
            return res.status(400).json({ message: 'Students require class and admissionYear' });
        }
        if (role === 'faculty' && (!department || !designation || !joiningYear)) {
            return res.status(400).json({ message: 'Faculty require department, designation, and joiningYear' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID or Email already exists' });
        }

        // Create user
        const newUser = new User({ userId, name, email, password, role });
        const savedUser = await newUser.save();

        // Create role-specific profile (optional)
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
            message: 'User created by admin successfully!',
            user: {
                id: savedUser._id,
                userId: savedUser.userId,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        console.error('Admin User Creation Error:', error);
        res.status(500).json({ message: 'Server error during user creation' });
    }
});

module.exports = router;