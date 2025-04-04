// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// POST /api/admin/users - Create a new user (admin only)
router.post(
    '/users',
    [
        body('userId').trim().notEmpty().withMessage('User ID is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['student', 'faculty', 'admin']).withMessage('Role must be student, faculty, or admin'),
        // Student-specific validation
        body('class').if(body('role').equals('student')).notEmpty().withMessage('Class is required for students'),
        body('admissionYear').if(body('role').equals('student')).isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Valid admission year required for students'),
        // Faculty-specific validation
        body('department').if(body('role').equals('faculty')).notEmpty().withMessage('Department is required for faculty'),
        body('designation').if(body('role').equals('faculty')).notEmpty().withMessage('Designation is required for faculty'),
        body('joiningYear').if(body('role').equals('faculty')).isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid joining year required for faculty'),
    ],
    validate,
    async (req, res) => {
        try {
            const { userId, name, email, password, role, class: classId, admissionYear, department, designation, joiningYear, qualifications } = req.body;

            // Check for existing user
            const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
            if (existingUser) {
                return res.status(400).json({ message: 'User ID or Email already exists' });
            }

            // Create user
            const newUser = new User({ userId, name, email, password, role });
            const savedUser = await newUser.save();

            // Create role-specific profile
            if (role === 'student') {
                await StudentProfile.create({ user: savedUser._id, class: classId, admissionYear });
            } else if (role === 'faculty') {
                await FacultyProfile.create({
                    user: savedUser._id,
                    department,
                    designation,
                    joiningYear,
                    qualifications: qualifications || [],
                });
            }

            res.status(201).json({
                message: 'User created successfully!',
                user: { id: savedUser._id, userId, name, email, role },
            });
        } catch (error) {
            console.error('Admin User Creation Error:', error);
            res.status(500).json({ message: 'Server error during user creation' });
        }
    }
);

// GET /api/admin/users - List all users with pagination
router.get(
    '/users',
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

            const totalUsers = await User.countDocuments();
            const users = await User.find()
                .select('-password') // Exclude password from response
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

// GET /api/admin/users/:id - Fetch a specific user’s details
router.get(
    '/users/:id',
    [param('id').isMongoId().withMessage('Invalid user ID')],
    validate,
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            let profile = null;
            if (user.role === 'student') {
                profile = await StudentProfile.findOne({ user: user._id });
            } else if (user.role === 'faculty') {
                profile = await FacultyProfile.findOne({ user: user._id });
            }

            res.status(200).json({
                message: 'User retrieved successfully',
                user: { ...user.toObject(), profile },
            });
        } catch (error) {
            console.error('Get User Error:', error);
            res.status(500).json({ message: 'Server error while fetching user' });
        }
    }
);

// PUT /api/admin/users/:id - Update a user’s information (with student and faculty profile support)
router.put(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['student', 'faculty', 'admin']).withMessage('Role must be student, faculty, or admin'),
        body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        // Student-specific fields with corrected conditional validation
        body('class')
            .optional()
            .if((value, { req }) => req.body.role === 'student' || req.userRole === 'student')
            .isMongoId()
            .withMessage('Valid class ID is required for students'),
        body('admissionYear')
            .optional()
            .if((value, { req }) => req.body.role === 'student' || req.userRole === 'student')
            .isInt({ min: 2000, max: new Date().getFullYear() })
            .withMessage('Valid admission year required for students'),
        body('status')
            .optional()
            .if((value, { req }) => req.body.role === 'student' || req.userRole === 'student')
            .isIn(['active', 'graduated', 'inactive', 'dropped'])
            .withMessage('Status must be active, graduated, inactive, or dropped'),
        // Faculty-specific fields with corrected conditional validation
        body('department')
            .optional()
            .if((value, { req }) => req.body.role === 'faculty' || req.userRole === 'faculty')
            .notEmpty()
            .withMessage('Department cannot be empty for faculty'),
        body('designation')
            .optional()
            .if((value, { req }) => req.body.role === 'faculty' || req.userRole === 'faculty')
            .notEmpty()
            .withMessage('Designation cannot be empty for faculty'),
        body('joiningYear')
            .optional()
            .if((value, { req }) => req.body.role === 'faculty' || req.userRole === 'faculty')
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Valid joining year required for faculty'),
        body('qualifications')
            .optional()
            .isArray()
            .withMessage('Qualifications must be an array'),
    ],
    validate,
    async (req, res) => {
        try {
            const { 
                name, 
                email, 
                password, 
                role, 
                isActive, 
                class: classId, 
                admissionYear, 
                status, 
                department, 
                designation, 
                joiningYear, 
                qualifications 
            } = req.body;

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Store the current role for validation purposes
            req.userRole = user.role; // Pass the current role to the validator

            // Update User fields if provided
            const userUpdates = {};
            if (name) userUpdates.name = name;
            if (email) userUpdates.email = email;
            if (password) userUpdates.password = password;
            if (role) userUpdates.role = role;
            if (typeof isActive === 'boolean') userUpdates.isActive = isActive;

            if (Object.keys(userUpdates).length > 0) {
                Object.assign(user, userUpdates);
                await user.save();
            }

            // Handle profile updates based on role
            let profile = null;

            // Student profile updates
            if (user.role === 'student' && (classId || admissionYear || status)) {
                profile = await StudentProfile.findOne({ user: user._id });
                if (!profile) {
                    return res.status(400).json({ message: 'Student profile not found for this user' });
                }

                const studentUpdates = {};
                if (classId) studentUpdates.class = classId;
                if (admissionYear) studentUpdates.admissionYear = admissionYear;
                if (status) studentUpdates.status = status;

                Object.assign(profile, studentUpdates);
                await profile.save();
            }

            // Faculty profile updates
            if (user.role === 'faculty' && (department || designation || joiningYear || qualifications)) {
                profile = await FacultyProfile.findOne({ user: user._id });
                if (!profile) {
                    return res.status(400).json({ message: 'Faculty profile not found for this user' });
                }

                const facultyUpdates = {};
                if (department) facultyUpdates.department = department;
                if (designation) facultyUpdates.designation = designation;
                if (joiningYear) facultyUpdates.joiningYear = joiningYear;
                if (qualifications) facultyUpdates.qualifications = qualifications;

                Object.assign(profile, facultyUpdates);
                await profile.save();
            }

            // Fetch updated profile for response
            if (user.role === 'student') {
                profile = await StudentProfile.findOne({ user: user._id });
            } else if (user.role === 'faculty') {
                profile = await FacultyProfile.findOne({ user: user._id });
            }

            res.status(200).json({
                message: 'User updated successfully',
                user: { ...user.toObject(), profile: profile ? profile.toObject() : null },
            });
        } catch (error) {
            console.error('Update User Error:', error);
            res.status(500).json({ message: 'Server error while updating user' });
        }
    }
);

// DELETE /api/admin/users/:id - Delete a user with cascade
router.delete(
    '/users/:id',
    [param('id').isMongoId().withMessage('Invalid user ID')],
    validate,
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Cascade delete profile based on role
            if (user.role === 'student') {
                await StudentProfile.deleteOne({ user: user._id });
            } else if (user.role === 'faculty') {
                await FacultyProfile.deleteOne({ user: user._id });
            }

            await User.deleteOne({ _id: req.params.id });

            res.status(200).json({ message: 'User and associated profile deleted successfully' });
        } catch (error) {
            console.error('Delete User Error:', error);
            res.status(500).json({ message: 'Server error while deleting user' });
        }
    }
);

module.exports = router;
