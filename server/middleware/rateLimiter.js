// middleware/ratelimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    handler: (req, res) => {
        logger.warnWithContext('Rate limit exceeded', req, {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            message: 'Too many login attempts from this IP, please try again after 15 minutes'
        });
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;