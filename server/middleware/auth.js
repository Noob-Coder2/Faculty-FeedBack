// Server/middleware/auth.js

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'
    if (!token) {
        logger.errorWithContext('Authentication failed: No token provided', req);
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds { id, role } to req
        logger.debugWithContext('Authentication successful', req, { userId: decoded.id, role: decoded.role });
        next();
    } catch (error) {
        logger.errorWithContext('Authentication failed: Invalid token', req, error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;