// Server/middleware/auth.js

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        logger.errorWithContext('Authentication failed: No token cookie', req);
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds { id, role } to req
        logger.debugWithContext('Authentication successful', req, { 
            userId: decoded.id, 
            role: decoded.role 
        });
        next();
    } catch (error) {
        logger.errorWithContext('Authentication failed: Invalid token', req, error);
        res.clearCookie('auth_token');
        res.status(401).json({ message: 'Session expired. Please login again.' });
    }
};

module.exports = auth;