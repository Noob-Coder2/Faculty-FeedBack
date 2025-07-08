// Server/middleware/role.js

const logger = require('../utils/logger');

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        logger.errorWithContext('Access denied: Insufficient permissions', req, {
            requiredRoles: roles,
            userRole: req.user.role
        });
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    logger.debugWithContext('Role check passed', req, {
        requiredRoles: roles,
        userRole: req.user.role
    });
    next();
};

module.exports = checkRole;