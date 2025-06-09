// server/routes/profile.js

const express = require('express');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const validate = require('../middleware/validate');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    logger.debugWithContext('Fetching user profile', req, { userId: req.user.id });

    const userId = req.user.id;
    if (!userId) {
      logger.errorWithContext('Invalid token: userId missing', req);
      return res.status(400).json({ message: 'Invalid token: userId missing' });
    }

    const user = await User.findOne({ userId }).select('-password');
    if (!user) {
      logger.errorWithContext('User not found', req, { userId });
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('classId', 'name branch semester section academicYear');
      if (!profile) {
        logger.errorWithContext('Student profile not found', req, { userId });
        return res.status(404).json({ message: 'Student profile not found' });
      }
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id }).populate('subjects', 'subjectCode subjectName');
      if (!profile) {
        logger.errorWithContext('Faculty profile not found', req, { userId });
        return res.status(404).json({ message: 'Faculty profile not found' });
      }
    }

    logger.infoWithContext('Profile fetched successfully', req, { userId, role: user.role });
    res.json({
      message: 'Profile fetched successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile: profile ? profile.toObject() : null,
      },
    });
  } catch (err) {
    logger.errorWithContext('Profile fetch error', req, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/users/profile
router.patch(
  '/profile',
  [
    auth,
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validate,
  async (req, res) => {
    try {
      logger.debugWithContext('Updating user profile', req, { userId: req.user.id, body: req.body });

      const userId = req.user.id;
      const { email } = req.body;

      const user = await User.findOne({ userId });
      if (!user) {
        logger.errorWithContext('User not found', req, { userId });
        return res.status(404).json({ message: 'User not found' });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          logger.errorWithContext('Email already in use', req, { email });
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = email;
      } else {
        logger.warnWithContext('No valid email provided for update', req, { userId });
        return res.status(400).json({ message: 'No valid email provided for update' });
      }

      await user.save();

      let profile = null;
      if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id }).populate('classId', 'name branch semester section academicYear');
      } else if (user.role === 'faculty') {
        profile = await FacultyProfile.findOne({ user: user._id }).populate('subjects', 'subjectCode subjectName');
      }

      logger.infoWithContext('Profile updated successfully', req, { userId, updatedEmail: email });
      res.json({
        message: 'Profile updated successfully',
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          profile: profile ? profile.toObject() : null,
        },
      });
    } catch (err) {
      logger.errorWithContext('Profile update error', req, err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;