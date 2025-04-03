// server/routes/login.js
const express = require('express');
const jwt = require('jsonwebtoken'); // Added for JWT
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/login
router.post('/', async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Basic validation
        if (!userId || !password) {
            return res.status(400).json({ message: 'Please provide User ID and Password' });
        }

        // Find user
        const user = await User.findOne({ userId });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or inactive user' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token, // Send token to client
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;