// server/middleware/validate.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    console.log('Validating request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

module.exports = validate;