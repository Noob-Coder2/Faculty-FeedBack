// server/routes/teaching-assignments.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const TeachingAssignment = require('../models/TeachingAssignment');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const FeedbackPeriod = require('../models/FeedbackPeriod');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// POST /api/admin/teaching-assignments - Assign a faculty member to a subject and class for a feedback period
router.post(
    '/',
    [
        body('faculty').isMongoId().withMessage('Valid faculty ID is required'),
        body('subject').isMongoId().withMessage('Valid subject ID is required'),
        body('class').isMongoId().withMessage('Valid class ID is required'),
        body('feedbackPeriod').isMongoId().withMessage('Valid feedback period ID is required'),
    ],
    validate,
    async (req, res) => {
        try {
            const { faculty, subject, class: classId, feedbackPeriod } = req.body;

            // Validate referenced documents exist
            const facultyDoc = await User.findOne({ _id: faculty, role: 'faculty' });
            if (!facultyDoc) {
                return res.status(400).json({ message: 'Faculty member not found or not a faculty role' });
            }

            const subjectDoc = await Subject.findById(subject);
            if (!subjectDoc) {
                return res.status(400).json({ message: 'Subject not found' });
            }

            const classDoc = await Class.findById(classId);
            if (!classDoc) {
                return res.status(400).json({ message: 'Class not found' });
            }

            const feedbackPeriodDoc = await FeedbackPeriod.findById(feedbackPeriod);
            if (!feedbackPeriodDoc) {
                return res.status(400).json({ message: 'Feedback period not found' });
            }

            // Check for duplicate assignment (unique index already enforces this, but let's catch it early)
            const existingAssignment = await TeachingAssignment.findOne({ faculty, subject, class: classId, feedbackPeriod });
            if (existingAssignment) {
                return res.status(400).json({ message: 'This teaching assignment already exists' });
            }

            const newAssignment = new TeachingAssignment({ faculty, subject, class: classId, feedbackPeriod });
            const savedAssignment = await newAssignment.save();

            res.status(201).json({
                message: 'Teaching assignment created successfully',
                teachingAssignment: savedAssignment,
            });
        } catch (error) {
            console.error('Create Teaching Assignment Error:', error);
            res.status(500).json({ message: 'Server error while creating teaching assignment' });
        }
    }
);

// GET /api/admin/teaching-assignments - List all teaching assignments with pagination
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

            const totalAssignments = await TeachingAssignment.countDocuments();
            const teachingAssignments = await TeachingAssignment.find()
                .populate('faculty', 'name userId') // Populate faculty name and userId
                .populate('subject', 'subjectCode subjectName') // Populate subject details
                .populate('class', 'name') // Populate class name
                .populate('feedbackPeriod', 'name startDate endDate') // Populate feedback period details
                .skip(skip)
                .limit(limit);

            res.status(200).json({
                message: 'Teaching assignments retrieved successfully',
                teachingAssignments,
                pagination: {
                    total: totalAssignments,
                    page,
                    limit,
                    totalPages: Math.ceil(totalAssignments / limit),
                },
            });
        } catch (error) {
            console.error('Get Teaching Assignments Error:', error);
            res.status(500).json({ message: 'Server error while fetching teaching assignments' });
        }
    }
);

// GET /api/admin/teaching-assignments/:id - Get a specific teaching assignment
router.get(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid teaching assignment ID')],
    validate,
    async (req, res) => {
        try {
            const teachingAssignment = await TeachingAssignment.findById(req.params.id)
                .populate('faculty', 'name userId')
                .populate('subject', 'subjectCode subjectName')
                .populate('class', 'name')
                .populate('feedbackPeriod', 'name startDate endDate');
            if (!teachingAssignment) {
                return res.status(404).json({ message: 'Teaching assignment not found' });
            }

            res.status(200).json({
                message: 'Teaching assignment retrieved successfully',
                teachingAssignment,
            });
        } catch (error) {
            console.error('Get Teaching Assignment Error:', error);
            res.status(500).json({ message: 'Server error while fetching teaching assignment' });
        }
    }
);

// PUT /api/admin/teaching-assignments/:id - Update a teaching assignment
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid teaching assignment ID'),
        body('faculty').optional().isMongoId().withMessage('Valid faculty ID is required'),
        body('subject').optional().isMongoId().withMessage('Valid subject ID is required'),
        body('class').optional().isMongoId().withMessage('Valid class ID is required'),
        body('feedbackPeriod').optional().isMongoId().withMessage('Valid feedback period ID is required'),
    ],
    validate,
    async (req, res) => {
        try {
            const updates = req.body;
            const teachingAssignment = await TeachingAssignment.findById(req.params.id);
            if (!teachingAssignment) {
                return res.status(404).json({ message: 'Teaching assignment not found' });
            }

            // Validate updated references if provided
            if (updates.faculty) {
                const facultyDoc = await User.findOne({ _id: updates.faculty, role: 'faculty' });
                if (!facultyDoc) {
                    return res.status(400).json({ message: 'Faculty member not found or not a faculty role' });
                }
            }
            if (updates.subject) {
                const subjectDoc = await Subject.findById(updates.subject);
                if (!subjectDoc) {
                    return res.status(400).json({ message: 'Subject not found' });
                }
            }
            if (updates.class) {
                const classDoc = await Class.findById(updates.class);
                if (!classDoc) {
                    return res.status(400).json({ message: 'Class not found' });
                }
            }
            if (updates.feedbackPeriod) {
                const feedbackPeriodDoc = await FeedbackPeriod.findById(updates.feedbackPeriod);
                if (!feedbackPeriodDoc) {
                    return res.status(400).json({ message: 'Feedback period not found' });
                }
            }

            // Check for duplicate if key fields change
            const { faculty, subject, class: classId, feedbackPeriod } = { ...teachingAssignment.toObject(), ...updates };
            const duplicateCheck = await TeachingAssignment.findOne({
                faculty,
                subject,
                class: classId,
                feedbackPeriod,
                _id: { $ne: req.params.id }, // Exclude current assignment
            });
            if (duplicateCheck) {
                return res.status(400).json({ message: 'Another teaching assignment with these details already exists' });
            }

            Object.assign(teachingAssignment, updates);
            const updatedAssignment = await teachingAssignment.save();

            // Populate for response
            await updatedAssignment.populate('faculty', 'name userId');
            await updatedAssignment.populate('subject', 'subjectCode subjectName');
            await updatedAssignment.populate('class', 'name');
            await updatedAssignment.populate('feedbackPeriod', 'name startDate endDate');

            res.status(200).json({
                message: 'Teaching assignment updated successfully',
                teachingAssignment: updatedAssignment,
            });
        } catch (error) {
            console.error('Update Teaching Assignment Error:', error);
            res.status(500).json({ message: 'Server error while updating teaching assignment' });
        }
    }
);

// DELETE /api/admin/teaching-assignments/:id - Delete a teaching assignment
router.delete(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid teaching assignment ID')],
    validate,
    async (req, res) => {
        try {
            const teachingAssignment = await TeachingAssignment.findById(req.params.id);
            if (!teachingAssignment) {
                return res.status(404).json({ message: 'Teaching assignment not found' });
            }

            await TeachingAssignment.deleteOne({ _id: req.params.id });

            res.status(200).json({ message: 'Teaching assignment deleted successfully' });
        } catch (error) {
            console.error('Delete Teaching Assignment Error:', error);
            res.status(500).json({ message: 'Server error while deleting teaching assignment' });
        }
    }
);

module.exports = router;
