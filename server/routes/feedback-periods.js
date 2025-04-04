// server/routes/feedback-periods.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const FeedbackPeriod = require('../models/FeedbackPeriod');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// Function to determine status based on dates
const determineStatus = (startDate, endDate) => {
    const now = new Date();
    if (now < new Date(startDate)) return 'upcoming';
    if (now >= new Date(startDate) && now <= new Date(endDate)) return 'active';
    return 'closed';
};

// POST /api/admin/feedback-periods - Create a new feedback period
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Feedback period name is required'),
        body('semester').isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
        body('year').isInt({ min: 2000, max: new Date().getFullYear() + 1 }).withMessage('Year must be between 2000 and next year'),
        body('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
        body('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
        body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        // Removed status from body validation since we'll set it automatically
    ],
    validate,
    async (req, res) => {
        try {
            const { name, semester, year, startDate, endDate, isActive } = req.body;

            // Validate that endDate is after startDate
            if (new Date(endDate) <= new Date(startDate)) {
                return res.status(400).json({ message: 'End date must be after start date' });
            }

            // Auto-determine status based on dates
            const status = determineStatus(startDate, endDate);

            const newFeedbackPeriod = new FeedbackPeriod({
                name,
                semester,
                year,
                startDate,
                endDate,
                isActive: isActive || false, // Default to false if not provided
                status, // Set automatically
            });
            const savedFeedbackPeriod = await newFeedbackPeriod.save();

            res.status(201).json({
                message: 'Feedback period created successfully',
                feedbackPeriod: savedFeedbackPeriod,
            });
        } catch (error) {
            console.error('Create Feedback Period Error:', error);
            res.status(500).json({ message: 'Server error while creating feedback period' });
        }
    }
);

// GET /api/admin/feedback-periods - List all feedback periods with pagination
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

            const totalFeedbackPeriods = await FeedbackPeriod.countDocuments();
            const feedbackPeriods = await FeedbackPeriod.find()
                .skip(skip)
                .limit(limit);

            // Update status dynamically for each period in the list
            const updatedFeedbackPeriods = feedbackPeriods.map(period => {
                const updatedStatus = determineStatus(period.startDate, period.endDate);
                return { ...period.toObject(), status: updatedStatus };
            });

            res.status(200).json({
                message: 'Feedback periods retrieved successfully',
                feedbackPeriods: updatedFeedbackPeriods,
                pagination: {
                    total: totalFeedbackPeriods,
                    page,
                    limit,
                    totalPages: Math.ceil(totalFeedbackPeriods / limit),
                },
            });
        } catch (error) {
            console.error('Get Feedback Periods Error:', error);
            res.status(500).json({ message: 'Server error while fetching feedback periods' });
        }
    }
);

// GET /api/admin/feedback-periods/:id - Get a specific feedback period
router.get(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid feedback period ID')],
    validate,
    async (req, res) => {
        try {
            const feedbackPeriod = await FeedbackPeriod.findById(req.params.id);
            if (!feedbackPeriod) {
                return res.status(404).json({ message: 'Feedback period not found' });
            }

            // Update status dynamically
            const updatedStatus = determineStatus(feedbackPeriod.startDate, feedbackPeriod.endDate);
            const updatedFeedbackPeriod = { ...feedbackPeriod.toObject(), status: updatedStatus };

            res.status(200).json({
                message: 'Feedback period retrieved successfully',
                feedbackPeriod: updatedFeedbackPeriod,
            });
        } catch (error) {
            console.error('Get Feedback Period Error:', error);
            res.status(500).json({ message: 'Server error while fetching feedback period' });
        }
    }
);

// PUT /api/admin/feedback-periods/:id - Update a feedback period (e.g., open or close it)
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid feedback period ID'),
        body('name').optional().trim().notEmpty().withMessage('Feedback period name cannot be empty'),
        body('semester').optional().isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
        body('year').optional().isInt({ min: 2000, max: new Date().getFullYear() + 1 }).withMessage('Year must be between 2000 and next year'),
        body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
        body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
        body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        // Removed status from body validation since we'll set it automatically
    ],
    validate,
    async (req, res) => {
        try {
            const { name, semester, year, startDate, endDate, isActive } = req.body;
            const feedbackPeriod = await FeedbackPeriod.findById(req.params.id);
            if (!feedbackPeriod) {
                return res.status(404).json({ message: 'Feedback period not found' });
            }

            // Prepare updates
            const updates = {};
            if (name) updates.name = name;
            if (semester) updates.semester = semester;
            if (year) updates.year = year;
            if (startDate) updates.startDate = startDate;
            if (endDate) updates.endDate = endDate;
            if (typeof isActive === 'boolean') updates.isActive = isActive;

            // Determine new dates for status calculation
            const newStartDate = updates.startDate || feedbackPeriod.startDate;
            const newEndDate = updates.endDate || feedbackPeriod.endDate;

            // Validate dates if either is updated
            if ((startDate || endDate) && new Date(newEndDate) <= new Date(newStartDate)) {
                return res.status(400).json({ message: 'End date must be after start date' });
            }

            // Auto-update status based on dates
            updates.status = determineStatus(newStartDate, newEndDate);

            Object.assign(feedbackPeriod, updates);
            const updatedFeedbackPeriod = await feedbackPeriod.save();

            res.status(200).json({
                message: 'Feedback period updated successfully',
                feedbackPeriod: updatedFeedbackPeriod,
            });
        } catch (error) {
            console.error('Update Feedback Period Error:', error);
            res.status(500).json({ message: 'Server error while updating feedback period' });
        }
    }
);

module.exports = router;