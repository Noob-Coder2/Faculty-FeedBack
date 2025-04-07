// server/routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Class = require('../models/Class');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};


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
        const { userId, password } = req.body;
  
        // Find user
        const user = await User.findOne({ userId });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
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
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
      } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
      }
    }
  );

module.exports = router;