// server/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const FacultyProfile = require('./models/FacultyProfile');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const FeedbackPeriod = require('./models/FeedbackPeriod');
const RatingParameter = require('./models/RatingParameter');
const TeachingAssignment = require('./models/TeachingAssignment');
const AggregatedRating = require('./models/AggregatedRating');
const Feedback = require('./models/Feedback');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Clear existing data (except admins)
    await Promise.all([
      StudentProfile.deleteMany({}),
      FacultyProfile.deleteMany({}),
      Class.deleteMany({}),
      Subject.deleteMany({}),
      FeedbackPeriod.deleteMany({}),
      RatingParameter.deleteMany({}),
      TeachingAssignment.deleteMany({}),
      AggregatedRating.deleteMany({}),
      Feedback.deleteMany({}),
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
      { name: 'CS601', branch: 'CSE', semester: '6', year: 2025, section: 'A', academicYear: '2024-2025' },
      { name: 'EC401', branch: 'ECE', semester: '4', year: 2025, section: 'B', academicYear: '2024-2025' },
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
      { subjectCode: 'CS503', subjectName: 'Artificial Intelligence', branch: 'CSE', semester: 5 },
      { subjectCode: 'CS303', subjectName: 'Computer Networks', branch: 'CSE', semester: 3 },
      { subjectCode: 'EC402', subjectName: 'Robotics', branch: 'ECE', semester: 4 },
      { subjectCode: 'ME601', subjectName: 'Fluid Mechanics', branch: 'ME', semester: 6 },
    ];
    const savedSubjects = await Subject.insertMany(subjects);
    console.log('Subjects seeded');

    // Feedback Periods (Past and Current)
    const feedbackPeriods = [
      {
        name: 'Fall 2024 Feedback',
        semester: 1,
        year: 2024,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-15'),
        isActive: false,
        status: 'closed',
      },
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
    const savedRatingParameters = await RatingParameter.insertMany(ratingParameters);
    console.log('Rating Parameters seeded');

    // Faculty
    const facultyData = [
      {
        user: { userId: 'FAC001', name: 'Dr. Jane Smith', email: 'jane.smith@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Computer Science',
          designation: 'Professor',
          joiningYear: 2015,
          qualifications: ['PhD'],
          subjects: [savedSubjects[0]._id, savedSubjects[1]._id, savedSubjects[13]._id],
        },
      },
      {
        user: { userId: 'FAC002', name: 'Prof. Mark Lee', email: 'mark.lee@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Electronics',
          designation: 'Associate Professor',
          joiningYear: 2018,
          qualifications: ['MTech', 'PhD'],
          subjects: [savedSubjects[5]._id, savedSubjects[6]._id, savedSubjects[14]._id],
        },
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
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, subjects: [savedSubjects[1]._id, savedSubjects[13]._id], pendingMapping: false },
      },
      {
        user: { userId: 'STU002', name: 'Bob Brown', email: 'bob@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, subjects: [savedSubjects[1]._id, savedSubjects[13]._id], pendingMapping: false },
      },
    ];
    const savedStudents = [];
    for (const { user, profile } of studentData) {
      const student = new User(user);
      const saved = await student.save();
      await StudentProfile.create({ user: saved._id, ...profile });
      savedStudents.push(saved);
    }
    console.log('Students seeded');

    // Teaching Assignments
    const teachingAssignments = [
      // Past Period (Fall 2024)
      { faculty: savedFaculty[0]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedFeedbackPeriods[0]._id },

      // Current Period (Spring 2025)
      { faculty: savedFaculty[0]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedFeedbackPeriods[1]._id },
      { faculty: savedFaculty[0]._id, subject: savedSubjects[13]._id, class: savedClasses[1]._id, feedbackPeriod: savedFeedbackPeriods[1]._id },
    ];
    const savedTeachingAssignments = await TeachingAssignment.insertMany(teachingAssignments);
    console.log('Teaching Assignments seeded');

    // --- SEEDING INDIVIDUAL FEEDBACK & AGGREGATED RATINGS ---

    // 1. Past Feedback (Fall 2024) - For Trend Analysis
    // Student 1 -> Assignment 0 (Jane Smith, CS302, Fall 2024)
    await Feedback.create({
      teachingAssignment: savedTeachingAssignments[0]._id,
      student: savedStudents[0]._id,
      ratings: savedRatingParameters.map(rp => ({ ratingParameter: rp._id, value: 3 })), // Average 3.0
      comment: "Good but could be better.",
      submittedAt: new Date('2024-11-10')
    });

    // Create Aggregated Rating for Assignment 0
    for (const rp of savedRatingParameters) {
      await AggregatedRating.create({
        teachingAssignment: savedTeachingAssignments[0]._id,
        ratingParameter: rp._id,
        totalResponses: 1,
        ratingSum: 3,
        averageRating: 3.0
      });
    }

    // 2. Current Feedback (Spring 2025) - For History & Current Stats
    // Student 1 -> Assignment 1 (Jane Smith, CS302, Spring 2025)
    await Feedback.create({
      teachingAssignment: savedTeachingAssignments[1]._id,
      student: savedStudents[0]._id,
      ratings: savedRatingParameters.map(rp => ({ ratingParameter: rp._id, value: 5 })), // Average 5.0
      comment: "Excellent teaching style!",
      submittedAt: new Date('2025-04-05')
    });

    // Student 2 -> Assignment 1 (Jane Smith, CS302, Spring 2025)
    await Feedback.create({
      teachingAssignment: savedTeachingAssignments[1]._id,
      student: savedStudents[1]._id,
      ratings: savedRatingParameters.map(rp => ({ ratingParameter: rp._id, value: 4 })), // Average 4.0
      comment: "Very knowledgeable.",
      submittedAt: new Date('2025-04-06')
    });

    // Create Aggregated Rating for Assignment 1 (Total 2 responses, Avg 4.5)
    for (const rp of savedRatingParameters) {
      await AggregatedRating.create({
        teachingAssignment: savedTeachingAssignments[1]._id,
        ratingParameter: rp._id,
        totalResponses: 2,
        ratingSum: 9,
        averageRating: 4.5
      });
    }

    console.log('Feedback and Aggregated Ratings seeded');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedData();
