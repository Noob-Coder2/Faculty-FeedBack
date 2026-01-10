// server/routes/reset-password.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const User = require('../models/User');
const logger = require('../utils/logger');

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    [
        body('email').isEmail().withMessage('Please provide a valid email address'),
    ],
    validate,
    async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                // For security, don't reveal if user exists
                return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
            }

            // Generate token
            const token = crypto.randomBytes(20).toString('hex');

            // Set token and expiry (1 hour)
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();

            // In a real app, send email here. For now, log to console.
            const resetLink = `http://localhost:5173/reset-password/${token}`;
            console.log('---------------------------------------------------');
            console.log(`PASSWORD RESET LINK FOR ${email}:`);
            console.log(resetLink);
            console.log('---------------------------------------------------');
            logger.info(`Password reset requested for ${email}`);

            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (error) {
            logger.error('Forgot password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/auth/reset-password/:token
router.post(
    '/reset-password/:token',
    [
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one number')
            .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
    ],
    validate,
    async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
            }

            // Set new password
            user.password = password; // Pre-save hook will hash this
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            logger.info(`Password reset successful for user ${user.userId}`);
            res.status(200).json({ message: 'Password has been reset successfully.' });
        } catch (error) {
            logger.error('Reset password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

module.exports = router;
