// server/routes/subjects.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const validate = require('../middleware/validate');
const Subject = require('../models/Subject');


// POST /api/admin/subjects - Add a new subject
router.post(
    '/',
    [
        body('subjectCode').trim().escape().notEmpty().withMessage('Subject code is required'),
        body('subjectName').trim().escape().notEmpty().withMessage('Subject name is required'),
        body('branch').trim().escape().notEmpty().withMessage('Branch is required'),
        body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    ],
    validate,
    async (req, res) => {
        try {
            const { subjectCode, subjectName, branch, semester } = req.body;

            // Check for duplicate subject code (since it's unique in the model)
            const existingSubject = await Subject.findOne({ subjectCode });
            if (existingSubject) {
                return res.status(400).json({ message: 'Subject with this code already exists' });
            }

            const newSubject = new Subject({ subjectCode, subjectName, branch, semester });
            const savedSubject = await newSubject.save();

            res.status(201).json({
                message: 'Subject created successfully',
                subject: savedSubject,
            });
        } catch (error) {
            console.error('Create Subject Error:', error);
            res.status(500).json({ message: 'Server error while creating subject' });
        }
    }
);

// GET /api/admin/subjects - List all subjects with pagination
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

            const totalSubjects = await Subject.countDocuments();
            const subjects = await Subject.find()
                .skip(skip)
                .limit(limit);

            res.status(200).json({
                message: 'Subjects retrieved successfully',
                subjects,
                pagination: {
                    total: totalSubjects,
                    page,
                    limit,
                    totalPages: Math.ceil(totalSubjects / limit),
                },
            });
        } catch (error) {
            console.error('Get Subjects Error:', error);
            res.status(500).json({ message: 'Server error while fetching subjects' });
        }
    }
);

// GET /api/admin/subjects/:id - Get a specific subject
router.get(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid subject ID')],
    validate,
    async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id);
            if (!subject) {
                return res.status(404).json({ message: 'Subject not found' });
            }

            res.status(200).json({
                message: 'Subject retrieved successfully',
                subject,
            });
        } catch (error) {
            console.error('Get Subject Error:', error);
            res.status(500).json({ message: 'Server error while fetching subject' });
        }
    }
);

// PUT /api/admin/subjects/:id - Update a subject
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid subject ID'),
        body('subjectCode').optional().trim().escape().notEmpty().withMessage('Subject code cannot be empty'),
        body('subjectName').optional().trim().escape().notEmpty().withMessage('Subject name cannot be empty'),
        body('branch').optional().trim().escape().notEmpty().withMessage('Branch cannot be empty'),
        body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    ],
    validate,
    async (req, res) => {
        try {
            const updates = req.body;
            const subject = await Subject.findById(req.params.id);
            if (!subject) {
                return res.status(404).json({ message: 'Subject not found' });
            }

            // If updating subjectCode, check for uniqueness
            if (updates.subjectCode && updates.subjectCode !== subject.subjectCode) {
                const existingSubject = await Subject.findOne({ subjectCode: updates.subjectCode });
                if (existingSubject) {
                    return res.status(400).json({ message: 'Another subject with this code already exists' });
                }
            }

            Object.assign(subject, updates);
            const updatedSubject = await subject.save();

            res.status(200).json({
                message: 'Subject updated successfully',
                subject: updatedSubject,
            });
        } catch (error) {
            console.error('Update Subject Error:', error);
            res.status(500).json({ message: 'Server error while updating subject' });
        }
    }
);

// DELETE /api/admin/subjects/:id - Delete a subject
router.delete(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid subject ID')],
    validate,
    async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id);
            if (!subject) {
                return res.status(404).json({ message: 'Subject not found' });
            }

            await Subject.deleteOne({ _id: req.params.id });

            res.status(200).json({ message: 'Subject deleted successfully' });
        } catch (error) {
            console.error('Delete Subject Error:', error);
            res.status(500).json({ message: 'Server error while deleting subject' });
        }
    }
);

module.exports = router;