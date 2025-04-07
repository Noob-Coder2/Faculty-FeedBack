// middleware/ratelimiter.js
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP
    message: { message: 'Too many login attempts, please try again later' },
});

module.exports = loginLimiter;