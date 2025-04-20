// server/routes/auth.js

const express = require('express');
const router = express.Router();
const { body} = require('express-validator');
const validate = require('../middleware/validate');

// Import models    
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// PUT /api/user/change-password - Change user password
router.put(
    '/change-password',
    [
      auth,
      body('currentPassword').notEmpty().withMessage('Current password is required'),
      body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    ],
    validate,
    async (req, res) => {
      try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = newPassword; // Will be hashed by pre-save middleware
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

module.exports = router;