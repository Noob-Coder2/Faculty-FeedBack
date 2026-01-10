// server/routes/change-password.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Import model and middleware
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/auth');

// PUT /api/user/change-password - Change user password
router.put(
  '/change-password',
  [
    auth,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('New password must contain at least one number')
      .matches(/[\W_]/).withMessage('New password must contain at least one special character'),
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findOne({ userId: req.user.id });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = newPassword; // Will be hashed by pre-save middleware
      await user.save();
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;