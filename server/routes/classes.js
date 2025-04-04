// server/routes/classes.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const Class = require('../models/Class');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// POST /api/admin/classes - Create a new class
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Class name is required'),
        body('branch').trim().notEmpty().withMessage('Branch is required'),
        body('semester').trim().notEmpty().withMessage('Semester is required'),
        body('year').isInt({ min: 2000, max: new Date().getFullYear() + 1 }).withMessage('Year must be between 2000 and next year'),
        body('section').trim().notEmpty().withMessage('Section is required'),
        body('academicYear').trim().notEmpty().withMessage('Academic Year is required'),
    ],
    validate,
    async (req, res) => {
        try {
            const { name, branch, semester, year, section, academicYear } = req.body;

            // Check for duplicate class (optional, based on uniqueness needs)
            const existingClass = await Class.findOne({ name, branch, semester, year, section });
            if (existingClass) {
                return res.status(400).json({ message: 'Class with these details already exists' });
            }

            const newClass = new Class({ name, branch, semester, year, section, academicYear });
            const savedClass = await newClass.save();

            res.status(201).json({
                message: 'Class created successfully',
                class: savedClass,
            });
        } catch (error) {
            console.error('Create Class Error:', error);
            res.status(500).json({ message: 'Server error while creating class' });
        }
    }
);

// GET /api/admin/classes - List all classes with pagination
router.get(
    '/',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ],
    validate,
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const totalClasses = await Class.countDocuments();
            const classes = await Class.find()
                .skip(skip)
                .limit(limit);

            res.status(200).json({
                message: 'Classes retrieved successfully',
                classes,
                pagination: {
                    total: totalClasses,
                    page,
                    limit,
                    totalPages: Math.ceil(totalClasses / limit),
                },
            });
        } catch (error) {
            console.error('Get Classes Error:', error);
            res.status(500).json({ message: 'Server error while fetching classes' });
        }
    }
);

// GET /api/admin/classes/:id - Get details of a specific class
router.get(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid class ID')],
    validate,
    async (req, res) => {
        try {
            const classDoc = await Class.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: 'Class not found' });
            }

            res.status(200).json({
                message: 'Class retrieved successfully',
                class: classDoc,
            });
        } catch (error) {
            console.error('Get Class Error:', error);
            res.status(500).json({ message: 'Server error while fetching class' });
        }
    }
);

// PUT /api/admin/classes/:id - Update a class
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid class ID'),
        body('name').optional().trim().notEmpty().withMessage('Class name cannot be empty'),
        body('branch').optional().trim().notEmpty().withMessage('Branch cannot be empty'),
        body('semester').optional().trim().notEmpty().withMessage('Semester cannot be empty'),
        body('year').optional().isInt({ min: 2000, max: new Date().getFullYear() + 1 }).withMessage('Year must be between 2000 and next year'),
        body('section').optional().trim().notEmpty().withMessage('Section cannot be empty'),
        body('academicYear').optional().trim().notEmpty().withMessage('Academic Year cannot be empty'),
    ],
    validate,
    async (req, res) => {
        try {
            const updates = req.body;
            const classDoc = await Class.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: 'Class not found' });
            }

            Object.assign(classDoc, updates);
            const updatedClass = await classDoc.save();

            res.status(200).json({
                message: 'Class updated successfully',
                class: updatedClass,
            });
        } catch (error) {
            console.error('Update Class Error:', error);
            res.status(500).json({ message: 'Server error while updating class' });
        }
    }
);

// DELETE /api/admin/classes/:id - Delete a class
router.delete(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid class ID')],
    validate,
    async (req, res) => {
        try {
            const classDoc = await Class.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: 'Class not found' });
            }

            await Class.deleteOne({ _id: req.params.id });

            res.status(200).json({ message: 'Class deleted successfully' });
        } catch (error) {
            console.error('Delete Class Error:', error);
            res.status(500).json({ message: 'Server error while deleting class' });
        }
    }
);

module.exports = router;