// server/seed.js
const mongoose = require('mongoose');
require('dotenv').config();
require('./models/User');
require('./models/Class');
require('./models/Subject');
require('./models/StudentProfile');
require('./models/FeedbackPeriod');
require('./models/TeachingAssignment');
require('./models/RatingParameter');
require('./models/AggregatedRating');
require('./models/FeedbackSubmissionStatus');
require('./models/FacultyProfile');

const User = mongoose.model('User');
const Class = mongoose.model('Class');
const Subject = mongoose.model('Subject');
const StudentProfile = mongoose.model('StudentProfile');
const FacultyProfile = mongoose.model('FacultyProfile');
const FeedbackPeriod = mongoose.model('FeedbackPeriod');
const TeachingAssignment = mongoose.model('TeachingAssignment');
const RatingParameter = mongoose.model('RatingParameter');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB for seeding');

        // Clear existing data (optional)
        await mongoose.connection.db.dropDatabase();

        // Admin
        const admin = await User.create({
            userId: 'ADMIN001',
            name: 'Admin User',
            email: 'admin@college.edu',
            password: 'admin123',
            role: 'admin'
        });

        // Faculty
        const faculty = await User.create({
            userId: 'FAC001',
            name: 'Dr. Jane Smith',
            email: 'jane.smith@college.edu',
            password: 'faculty123',
            role: 'faculty'
        });
        await FacultyProfile.create({
            user: faculty._id,
            department: 'Computer Science',
            designation: 'Professor',
            joiningYear: 2018,
            qualifications: ['PhD'],
            isActive: true
        });

        // Student
        const student = await User.create({
            userId: 'STU001',
            name: 'John Doe',
            email: 'john.doe@college.edu',
            password: 'student123',
            role: 'student'
        });

        // Class
        const classDoc = await Class.create({
            name: 'CSE 2025 Batch A',
            branch: 'Computer Science',
            semester: 5,
            year: 2025,
            section: 'A',
            academicYear: '2023-2024'
        });

        // Student Profile
        await StudentProfile.create({
            user: student._id,
            class: classDoc._id, // Class will be assigned later
            admissionYear: 2022,
            status: 'active'
        });


        // Subject
        const subject = await Subject.create({
            subjectCode: 'CS301',
            subjectName: 'Operating Systems',
            branch: 'Computer Science',
            semester: 5
        });

        // Feedback Period
        const feedbackPeriod = await FeedbackPeriod.create({
            name: 'Fall 2025 Feedback',
            semester: 5,
            year: 2025,
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-30'),
            isActive: true
        });

        // Teaching Assignment
        await TeachingAssignment.create({
            faculty: faculty._id,
            subject: subject._id,
            class: classDoc._id,
            feedbackPeriod: feedbackPeriod._id
        });

        // Rating Parameter
        await RatingParameter.create({
            parameterId: 'PUNCTUALITY',
            questionText: `Rate the faculty's punctuality.`,
            order: 1,
            isActive: true,
            category: 'Teaching Quality'
        });

        console.log('Seed data added successfully!');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Seeding error:', err);
        mongoose.connection.close();
    });
