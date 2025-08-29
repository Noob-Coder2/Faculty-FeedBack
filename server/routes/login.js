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
  
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          logger.errorWithContext('Invalid credentials: password mismatch', req, { userId });
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        // Generate JWT
        const token = jwt.sign({ id: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Set secure cookie with token
        res.cookie('auth_token', token, {
          httpOnly: true, // Prevents JavaScript access
          secure: process.env.NODE_ENV === 'production', // HTTPS only in production
          sameSite: 'strict', // CSRF protection
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
