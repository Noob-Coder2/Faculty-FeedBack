// server/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const FacultyProfile = require('./models/FacultyProfile');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const FeedbackPeriod = require('./models/FeedbackPeriod');
const RatingParameter = require('./models/RatingParameter');
const TeachingAssignment = require('./models/TeachingAssignment'); // Add this import

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    await Promise.all([
      StudentProfile.deleteMany({}),
      FacultyProfile.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      FeedbackPeriod.deleteMany({}),
      RatingParameter.deleteMany({}),
      TeachingAssignment.deleteMany({}), // Clear existing assignments
      User.deleteMany({ role: { $ne: 'admin' } }),
    ]);
    console.log('Non-admin data cleared');

    // Classes
    const classes = [
      { name: 'CS101', branch: 'CSE', semester: '1', year: 2025, section: 'A', academicYear: '2024-2025' },
      { name: 'CS301', branch: 'CSE', semester: '3', year: 2025, section: 'A', academicYear: '2024-2025' },
      { name: 'EC201', branch: 'ECE', semester: '2', year: 2025, section: 'B', academicYear: '2024-2025' },
      { name: 'ME401', branch: 'ME', semester: '4', year: 2025, section: 'A', academicYear: '2024-2025' },
      { name: 'CS501', branch: 'CSE', semester: '5', year: 2025, section: 'B', academicYear: '2024-2025' },
      { name: 'EE601', branch: 'EE', semester: '6', year: 2025, section: 'A', academicYear: '2024-2025' },
    ];
    const savedClasses = await Class.insertMany(classes);
    console.log('Classes seeded');

    // Subjects
    const subjects = [
      { subjectCode: 'CS101', subjectName: 'Introduction to Programming', branch: 'CSE', semester: 1 },
      { subjectCode: 'CS302', subjectName: 'Database Systems', branch: 'CSE', semester: 3 },
      { subjectCode: 'CS201', subjectName: 'Data Structures', branch: 'CSE', semester: 2 },
      { subjectCode: 'CS401', subjectName: 'Operating Systems', branch: 'CSE', semester: 4 },
      { subjectCode: 'CS502', subjectName: 'Machine Learning', branch: 'CSE', semester: 5 },
      { subjectCode: 'EC202', subjectName: 'Circuit Theory', branch: 'ECE', semester: 2 },
      { subjectCode: 'EC301', subjectName: 'Digital Electronics', branch: 'ECE', semester: 3 },
      { subjectCode: 'ME401', subjectName: 'Thermodynamics', branch: 'ME', semester: 4 },
      { subjectCode: 'ME501', subjectName: 'Mechanical Design', branch: 'ME', semester: 5 },
      { subjectCode: 'EE601', subjectName: 'Power Systems', branch: 'EE', semester: 6 },
      { subjectCode: 'CS601', subjectName: 'Cloud Computing', branch: 'CSE', semester: 6 },
      { subjectCode: 'EE401', subjectName: 'Control Systems', branch: 'EE', semester: 4 },
    ];
    const savedSubjects = await Subject.insertMany(subjects);
    console.log('Subjects seeded');

    // Feedback Periods
    const feedbackPeriods = [
      {
        name: 'Spring 2025 Feedback',
        semester: 2,
        year: 2025,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-15'),
        isActive: true,
        status: 'active',
      },
    ];
    const savedFeedbackPeriods = await FeedbackPeriod.insertMany(feedbackPeriods);
    console.log('Feedback Periods seeded');

    // Rating Parameters
    const ratingParameters = [
      { parameterId: 'PUNCTUALITY', questionText: 'Rate the faculty\'s punctuality', order: 1 },
      { parameterId: 'KNOWLEDGE', questionText: 'Rate the faculty\'s subject knowledge', order: 2 },
      { parameterId: 'ENGAGEMENT', questionText: 'Rate the faculty\'s engagement with students', order: 3 },
      { parameterId: 'CLARITY', questionText: 'Rate the faculty\'s clarity in teaching', order: 4 },
      { parameterId: 'SUPPORT', questionText: 'Rate the faculty\'s supportiveness', order: 5 },
    ];
    await RatingParameter.insertMany(ratingParameters);
    console.log('Rating Parameters seeded');

    // Faculty
    const facultyData = [
      {
        user: { userId: 'FAC001', name: 'Dr. Jane Smith', email: 'jane.smith@example.com', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Computer Science', designation: 'Professor', joiningYear: 2015, qualifications: ['PhD'] },
      },
      {
        user: { userId: 'FAC002', name: 'Prof. Mark Lee', email: 'mark.lee@example.com', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Electronics', designation: 'Associate Professor', joiningYear: 2018, qualifications: ['MTech', 'PhD'] },
      },
      {
        user: { userId: 'FAC003', name: 'Dr. Emily Chen', email: 'emily.chen@example.com', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Mechanical', designation: 'Professor', joiningYear: 2012, qualifications: ['PhD'] },
      },
      {
        user: { userId: 'FAC004', name: 'Prof. Raj Patel', email: 'raj.patel@example.com', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Electrical', designation: 'Assistant Professor', joiningYear: 2020, qualifications: ['MTech'] },
      },
      {
        user: { userId: 'FAC005', name: 'Dr. Sarah Kim', email: 'sarah.kim@example.com', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Computer Science', designation: 'Professor', joiningYear: 2016, qualifications: ['PhD'] },
      },
    ];
    const savedFaculty = [];
    for (const { user, profile } of facultyData) {
      const faculty = new User(user);
      const saved = await faculty.save();
      await FacultyProfile.create({ user: saved._id, ...profile });
      savedFaculty.push(saved);
    }
    console.log('Faculty seeded');

    // Students
    const studentData = [
      {
        user: { userId: 'STU001', name: 'Alice Johnson', email: 'alice@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, pendingMapping: false }, // CS301
      },
      {
        user: { userId: 'STU002', name: 'Bob Brown', email: 'bob@example.com', password: 'student1234', role: 'student' },
        profile: { branch: 'CSE', semester: 3, section: 'A', admissionYear: 2023, pendingMapping: true },
      },
      {
        user: { userId: 'STU003', name: 'Charlie Davis', email: 'charlie@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 1, section: 'A', classId: savedClasses[0]._id, admissionYear: 2024, pendingMapping: false }, // CS101
      },
      {
        user: { userId: 'STU004', name: 'Diana Evans', email: 'diana@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ECE', semester: 2, section: 'B', classId: savedClasses[2]._id, admissionYear: 2024, pendingMapping: false }, // EC201
      },
      {
        user: { userId: 'STU005', name: 'Evan Foster', email: 'evan@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ME', semester: 4, section: 'A', classId: savedClasses[3]._id, admissionYear: 2022, pendingMapping: false }, // ME401
      },
      {
        user: { userId: 'STU006', name: 'Fiona Green', email: 'fiona@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 5, section: 'B', classId: savedClasses[4]._id, admissionYear: 2021, pendingMapping: false }, // CS501
      },
      {
        user: { userId: 'STU007', name: 'George Hill', email: 'george@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'EE', semester: 6, section: 'A', classId: savedClasses[5]._id, admissionYear: 2020, pendingMapping: false }, // EE601
      },
      {
        user: { userId: 'STU008', name: 'Hannah Ives', email: 'hannah@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, pendingMapping: false }, // CS301
      },
      {
        user: { userId: 'STU009', name: 'Ian James', email: 'ian@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ECE', semester: 2, section: 'B', classId: savedClasses[2]._id, admissionYear: 2024, pendingMapping: false }, // EC201
      },
      {
        user: { userId: 'STU010', name: 'Julia King', email: 'julia@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ME', semester: 4, section: 'A', classId: savedClasses[3]._id, admissionYear: 2022, pendingMapping: false }, // ME401
      },
    ];
    for (const { user, profile } of studentData) {
      const student = new User(user);
      const saved = await student.save();
      await StudentProfile.create({ user: saved._id, ...profile });
    }
    console.log('Students seeded');

    // Teaching Assignments (10 new entries)
    const teachingAssignments = [
      { faculty: savedFaculty[0]._id, subject: savedSubjects[0]._id, class: savedClasses[0]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC001: CS101 in CS101-A
      { faculty: savedFaculty[0]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC001: CS302 in CS301-A
      { faculty: savedFaculty[1]._id, subject: savedSubjects[5]._id, class: savedClasses[2]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC002: EC202 in EC201-B
      { faculty: savedFaculty[1]._id, subject: savedSubjects[6]._id, class: savedClasses[2]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC002: EC301 in EC201-B
      { faculty: savedFaculty[2]._id, subject: savedSubjects[7]._id, class: savedClasses[3]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC003: ME401 in ME401-A
      { faculty: savedFaculty[2]._id, subject: savedSubjects[8]._id, class: savedClasses[4]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC003: ME501 in CS501-B
      { faculty: savedFaculty[3]._id, subject: savedSubjects[9]._id, class: savedClasses[5]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC004: EE601 in EE601-A
      { faculty: savedFaculty[3]._id, subject: savedSubjects[11]._id, class: savedClasses[3]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC004: EE401 in ME401-A
      { faculty: savedFaculty[4]._id, subject: savedSubjects[4]._id, class: savedClasses[4]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC005: CS502 in CS501-B
      { faculty: savedFaculty[4]._id, subject: savedSubjects[10]._id, class: savedClasses[5]._id, feedbackPeriod: savedFeedbackPeriods[0]._id }, // FAC005: CS601 in EE601-A
    ];
    await TeachingAssignment.insertMany(teachingAssignments);
    console.log('Teaching Assignments seeded');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedData();