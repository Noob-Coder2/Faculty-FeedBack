// server/routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const validate = require('../middleware/validate');
const User = require('../models/User');
const logger = require('../utils/logger');


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
      logger.debugWithContext('Login attempt', req, { userId: req.body.userId });
      const { userId, password } = req.body;

      // Find user
      const user = await User.findOne({ userId });
      if (!user) {
        logger.errorWithContext('Invalid credentials: user not found', req, { userId });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        logger.warnWithContext('Login attempt on locked account', req, { userId });
        return res.status(423).json({
          message: 'Account is locked due to multiple failed login attempts. Please try again later.'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Increment failed login attempts
        user.failedLoginAttempts += 1;

        // Lock account if attempts exceed limit (5)
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
          logger.warnWithContext('Account locked due to failed attempts', req, { userId });
        }

        await user.save();

        logger.errorWithContext('Invalid credentials: password mismatch', req, { userId });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Reset failed attempts and update last login on successful login
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = Date.now();
      await user.save();

      // Generate JWT
      const token = jwt.sign({ id: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Set secure cookie with token
      res.cookie('auth_token', token, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'none', // CSRF protection
        maxAge: 3600000, // 1 hour in milliseconds
        path: '/' // Cookie is valid for all paths
      });

      logger.infoWithContext('Login successful', req, { userId, role: user.role });
      res.status(200).json({
        message: 'Login successful',
        user: {
          userId: user.userId,
          role: user.role,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      logger.errorWithContext('Login error', req, error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

module.exports = router;
