// server/middleware/validate.js
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validate = (req, res, next) => {
    console.log('Validating request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.errorWithContext('Validation failed', req, { errors: errors.array() });
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    logger.debugWithContext('Request validation passed', req);
    next();
};

module.exports = validate;