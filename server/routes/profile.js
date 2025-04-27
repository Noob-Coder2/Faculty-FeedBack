// server/routes/profile.js

const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/profile
// Fetch user profile using JWT token
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('req.user from auth middleware:', req.user); // Debug token data
    const userId = req.user.id; // Use "id" from token payload
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token: userId missing' });
    }
    const user = await User.findOne({ userId }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile fetched successfully', user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;