// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const validate = require('../middleware/validate');
const logger = require('../utils/logger');

// Import models    
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

// POST /api/admin/users - Create a new user (admin only)
router.post(
    '/users',
    [
        // Validations without escape. Sanitization is handled by express-mongo-sanitize globally.
        // Proper XSS prevention is best handled by encoding output on the frontend.
        body('userId').trim().notEmpty().withMessage('User ID is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['student', 'faculty', 'admin']).withMessage('Role must be student, faculty, or admin'),
        // Student-specific fields
        body('branch')
            .if(body('role').equals('student'))
            .trim()
            .notEmpty()
            .withMessage('Branch is required for students')
            .isIn(['CSE', 'ECE', 'ME', 'CE', 'EE', 'CSE AIML', 'CSE DS'])
            .withMessage('Branch must be one of: CSE, ECE, ME, CE, EE, CSE AIML, CSE DS'),
        body('semester')
            .if(body('role').equals('student'))
            .notEmpty()
            .withMessage('Semester is required for students')
            .isInt({ min: 1, max: 8 })
            .withMessage('Semester must be between 1 and 8'),
        body('section')
            .if(body('role').equals('student'))
            .trim()
            .notEmpty()
            .withMessage('Section is required for students')
            .isIn(['A', 'B', 'C'])
            .withMessage('Section must be A, B, or C'),
        body('academicYear')
            .if(body('role').equals('student'))
            .trim()
            .notEmpty()
            .withMessage('Academic year is required for students')
            .matches(/^\d{4}-\d{4}$/)
            .withMessage('Academic year must be in the format YYYY-YYYY (e.g., 2024-2025)'),
        body('admissionYear')
            .if(body('role').equals('student'))
            .notEmpty()
            .withMessage('Admission year is required for students')
            .isInt({ min: 2000, max: new Date().getFullYear() })
            .withMessage('Admission year must be between 2000 and the current year'),
        body('subjects')
            .if(body('role').equals('student'))
            .optional()
            .isArray()
            .withMessage('Subjects must be an array of subject IDs'),
        body('subjects.*')
            .if(body('role').equals('student'))
            .isMongoId()
            .withMessage('Each subject must be a valid MongoDB ID'),
        // Faculty-specific fields
        body('department')
            .if(body('role').equals('faculty'))
            .trim()
            .notEmpty()
            .withMessage('Department is required for faculty'),
        body('designation')
            .if(body('role').equals('faculty'))
            .notEmpty()
            .trim()
            .withMessage('Designation is required for faculty'),
        body('joiningYear')
            .if(body('role').equals('faculty'))
            .notEmpty()
            .withMessage('Joining year is required for faculty')
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Joining year must be between 1900 and the current year'),
        body('qualifications')
            .if(body('role').equals('faculty'))
            .optional()
            .isArray()
            .withMessage('Qualifications must be an array'),
    ],
    validate,
    async (req, res) => {
        logger.debugWithContext('Received request to create user', req, { userId: req.body.userId, role: req.body.role });

        // SECURITY: Explicitly block admin creation via this endpoint.
        if (req.body.role === 'admin') {
            logger.warnWithContext('Attempted to create admin via API', req, { userId: req.body.userId });
            return res.status(403).json({ message: 'Admin creation is not permitted through this API.' });
        }

        try {
            const {
                userId, name, email, password, role, branch, semester, section, academicYear, admissionYear,
                department, designation, joiningYear, qualifications, subjects,
            } = req.body;

            // Check for existing user
            const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
            if (existingUser) {
                logger.warnWithContext('User creation failed: User ID or Email already exists', req, { userId, email });
                return res.status(400).json({ message: 'User ID or Email already exists' });
            }

            // Create user
            const newUser = new User({ userId, name, email, password, role });
            const savedUser = await newUser.save();

            // Create role-specific profile
            if (role === 'student') {
                const classDoc = await Class.findOne({
                    branch,
                    semester: semester.toString(),
                    section,
                    academicYear,
                });
                const classId = classDoc ? classDoc._id : null;

                await StudentProfile.create({
                    user: savedUser._id,
                    classId,
                    branch,
                    semester,
                    section,
                    admissionYear,
                    subjects: subjects || [],
                    pendingMapping: !classId,
                });
            } else if (role === 'faculty') {
                await FacultyProfile.create({
                    user: savedUser._id,
                    subjects: subjects || [],
                    department,
                    designation,
                    joiningYear,
                    qualifications: qualifications || [],
                });
            }

            logger.infoWithContext('User created successfully', req, { userId, role, userMongoId: savedUser._id });
            res.status(201).json({
                message: 'User created successfully!',
                user: { id: savedUser._id, userId, name, email, role },
            });
        } catch (error) {
            logger.errorWithContext('User creation error', req, error);
            if (error.code === 11000) {
                return res.status(400).json({ message: 'User ID or Email already exists' });
            }
            res.status(500).json({ message: 'Server error during user creation' });
        }
    }
);

// Import new utilities
const upload = require('../middleware/upload');
const { parseCsv } = require('../utils/csvProcessor');
const { generatePdfReport, generateExcelReport } = require('../utils/reportGenerator');
const AggregatedRating = require('../models/AggregatedRating');

// ... (Existing imports)

// POST /api/admin/upload/users - Bulk upload users
router.post('/upload/users', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const users = await parseCsv(req.file.buffer);
        const results = { success: 0, failed: 0, errors: [] };

        for (const row of users) {
            try {
                // Basic validation and creation logic here (simplified for brevity)
                // In a real app, you'd reuse the validation logic or call a service
                const { userId, name, email, password, role } = row;
                if (!userId || !email || !password || !role) {
                    throw new Error('Missing required fields');
                }

                const hashedPassword = await require('bcrypt').hash(password, 10);
                await User.create({ userId, name, email, password: hashedPassword, role });
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ userId: row.userId, error: error.message });
            }
        }

        res.status(200).json({ message: 'Bulk upload processed', results });
    } catch (error) {
        logger.error('Bulk Upload Users Error:', error);
        res.status(500).json({ message: 'Server error during bulk upload' });
    }
});

// POST /api/admin/upload/classes - Bulk upload classes
router.post('/upload/classes', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const classes = await parseCsv(req.file.buffer);
        const results = { success: 0, failed: 0, errors: [] };

        for (const row of classes) {
            try {
                await Class.create(row);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ className: row.name, error: error.message });
            }
        }
        res.status(200).json({ message: 'Bulk upload processed', results });
    } catch (error) {
        logger.error('Bulk Upload Classes Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/upload/subjects - Bulk upload subjects
router.post('/upload/subjects', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const subjects = await parseCsv(req.file.buffer);
        const results = { success: 0, failed: 0, errors: [] };

        for (const row of subjects) {
            try {
                await Subject.create(row);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ subjectCode: row.code, error: error.message });
            }
        }
        res.status(200).json({ message: 'Bulk upload processed', results });
    } catch (error) {
        logger.error('Bulk Upload Subjects Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/reports/ratings/pdf
router.get('/reports/ratings/pdf', async (req, res) => {
    try {
        const ratings = await AggregatedRating.find().populate('faculty', 'name');
        const data = ratings.map(r => ({
            facultyName: r.faculty?.name || 'Unknown',
            subject: r.subject,
            averageRating: r.averageRating
        }));
        generatePdfReport(data, res);
    } catch (error) {
        logger.error('PDF Report Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/reports/ratings/excel
router.get('/reports/ratings/excel', async (req, res) => {
    try {
        const ratings = await AggregatedRating.find().populate('faculty', 'name');
        const data = ratings.map(r => ({
            facultyName: r.faculty?.name || 'Unknown',
            subject: r.subject,
            averageRating: r.averageRating,
            totalFeedbacks: r.totalFeedbacks
        }));
        await generateExcelReport(data, res);
    } catch (error) {
        logger.error('Excel Report Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/users - List all users with pagination and filtering
router.get(
    '/users',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('search').optional().trim(),
        query('role').optional().isIn(['student', 'faculty', 'admin']),
        query('department').optional().trim()
    ],
    validate,
    async (req, res) => {
        logger.debugWithContext('Received request to list users', req, {});

        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const { search, role, department } = req.query;

            const query = {};
            if (role) query.role = role;
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { userId: { $regex: search, $options: 'i' } }
                ];
            }

            // For department filtering, we'd need to join with FacultyProfile, which is complex in simple queries.
            // For now, we'll skip deep department filtering or handle it if role is faculty.

            const totalUsers = await User.countDocuments(query);
            const users = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(limit);

            res.status(200).json({
                message: 'Users retrieved successfully',
                users,
                pagination: {
                    total: totalUsers,
                    page,
                    limit,
                    totalPages: Math.ceil(totalUsers / limit),
                },
            });
        } catch (error) {
            console.error('Get Users Error:', error);
            res.status(500).json({ message: 'Server error while fetching users' });
        }
    }
);

module.exports = router;
