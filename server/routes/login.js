// server/routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const validate = require('../middleware/validate');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Class = require('../models/Class');


// POST /api/auth/login
router.post(
    '/',
    [
      body('userId').notEmpty().withMessage('User ID is required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    async (req, res) => {
      try {
        console.log('Login Request Body:', req.body);
        const { userId, password } = req.body;

        // Find user
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: 'No User Found' });
  
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
        // For students, check and update mapping
        if (user.role === 'student') {
          const studentProfile = await StudentProfile.findOne({ user: user._id });
          if (studentProfile && studentProfile.pendingMapping) {
            // Look for a mapped peer in the same section
            const mappedPeer = await StudentProfile.findOne({
              branch: studentProfile.branch,
              semester: studentProfile.semester,
              section: studentProfile.section,
              pendingMapping: false,
              classId: { $ne: null },
            });
  
            if (mappedPeer) {
              studentProfile.classId = mappedPeer.classId;
              studentProfile.pendingMapping = false;
              await studentProfile.save();
            }
          }
        }
  
        // Generate JWT
        const token = jwt.sign({ id: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token Payload:', token);
        res.status(200).json({ message: 'Login successful', token, userId: user.userId, role: user.role });
      } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
      }
    }
  );

module.exports = router;