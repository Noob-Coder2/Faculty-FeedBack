// server/routes/register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Class = require('../models/Class');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'faculty', 'admin']).withMessage('Role must be student, faculty, or admin'),
    // Student-specific fields
    body('branch').if(body('role').equals('student')).notEmpty().withMessage('Branch is required for students'),
    body('semester').if(body('role').equals('student')).notEmpty().withMessage('Semester is required for students'),
    body('section').if(body('role').equals('student')).notEmpty().withMessage('Section is required for students'),
    body('className').if(body('role').equals('student')).optional().notEmpty().withMessage('Class name is optional but cannot be empty'),
    body('admissionYear').if(body('role').equals('student')).notEmpty().withMessage('Admission year is required for students'),
    // Faculty-specific fields
    body('department').if(body('role').equals('faculty')).notEmpty().withMessage('Department is required for faculty'),
    body('designation').if(body('role').equals('faculty')).notEmpty().withMessage('Designation is required for faculty'),
    body('joiningYear').if(body('role').equals('faculty')).notEmpty().withMessage('Joining year is required for faculty'),
    body('qualifications').if(body('role').equals('faculty')).optional().isArray().withMessage('Qualifications must be an array'),
  ],
  validate,
  async (req, res) => {
    try {
      const { userId, name, email, password, role, branch, semester, section, class: className, admissionYear, department, designation, joiningYear, qualifications } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      user = new User({ userId, name, email, password: hashedPassword, role });
      await user.save();

      // Handle role-specific profiles
      if (role === 'admin') {
        return res.status(403).json({ message: 'Admin registration is not allowed here. Contact an administrator.' });
      }

      else if (role === 'student') {
        let classId = null;
        if (className) {
          const classDoc = await Class.findOne({ name: className, branch, semester, section });
          if (classDoc) classId = classDoc._id;
        }

        const studentProfile = new StudentProfile({
          user: user._id,
          branch,
          semester,
          section,
          classId, // Set if found, null if not
          admissionYear,
          pendingMapping: !classId, // True if no class found
        });
        await studentProfile.save();
      } else if (role === 'faculty') {
        const facultyProfile = new FacultyProfile({
          user: user._id,
          department,
          designation,
          joiningYear,
          qualifications: qualifications || [],
        });
        await facultyProfile.save();
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

module.exports = router;
