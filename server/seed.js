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

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
          subjects: [savedSubjects[0]._id, savedSubjects[1]._id, savedSubjects[13]._id], // CS101, CS302, CS303
        },
      },
      {
        user: { userId: 'FAC002', name: 'Prof. Mark Lee', email: 'mark.lee@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Electronics',
          designation: 'Associate Professor',
          joiningYear: 2018,
          qualifications: ['MTech', 'PhD'],
          subjects: [savedSubjects[5]._id, savedSubjects[6]._id, savedSubjects[14]._id], // EC202, EC301, EC402
        },
      },
      {
        user: { userId: 'FAC003', name: 'Dr. Emily Chen', email: 'emily.chen@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Mechanical',
          designation: 'Professor',
          joiningYear: 2012,
          qualifications: ['PhD'],
          subjects: [savedSubjects[7]._id, savedSubjects[8]._id, savedSubjects[15]._id], // ME401, ME501, ME601
        },
      },
      {
        user: { userId: 'FAC004', name: 'Prof. Raj Patel', email: 'raj.patel@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Electrical',
          designation: 'Assistant Professor',
          joiningYear: 2020,
          qualifications: ['MTech'],
          subjects: [savedSubjects[9]._id, savedSubjects[11]._id], // EE601, EE401
        },
      },
      {
        user: { userId: 'FAC005', name: 'Dr. Sarah Kim', email: 'sarah.kim@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Computer Science',
          designation: 'Professor',
          joiningYear: 2016,
          qualifications: ['PhD'],
          subjects: [savedSubjects[4]._id, savedSubjects[10]._id], // CS502, CS601
        },
      },
      {
        user: { userId: 'FAC006', name: 'Dr. Alice Wong', email: 'alice.wong@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Computer Science',
          designation: 'Associate Professor',
          joiningYear: 2017,
          qualifications: ['PhD'],
          subjects: [savedSubjects[12]._id, savedSubjects[13]._id], // CS503, CS303
        },
      },
      {
        user: { userId: 'FAC007', name: 'Prof. David Kumar', email: 'david.kumar@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Electronics',
          designation: 'Professor',
          joiningYear: 2014,
          qualifications: ['MTech', 'PhD'],
          subjects: [savedSubjects[14]._id, savedSubjects[6]._id], // EC402, EC301
        },
      },
      {
        user: { userId: 'FAC008', name: 'Dr. Michael Brown', email: 'michael.brown@example.com', password: 'faculty123', role: 'faculty' },
        profile: {
          department: 'Mechanical',
          designation: 'Assistant Professor',
          joiningYear: 2019,
          qualifications: ['PhD'],
          subjects: [savedSubjects[15]._id, savedSubjects[7]._id], // ME601, ME401
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
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, pendingMapping: false },
      },
      {
        user: { userId: 'STU002', name: 'Bob Brown', email: 'bob@example.com', password: 'student1234', role: 'student' },
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, pendingMapping: false },
      },
      {
        user: { userId: 'STU003', name: 'Charlie Davis', email: 'charlie@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 1, section: 'A', classId: savedClasses[0]._id, admissionYear: 2024, pendingMapping: false },
      },
      {
        user: { userId: 'STU004', name: 'Diana Evans', email: 'diana@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ECE', semester: 2, section: 'B', classId: savedClasses[2]._id, admissionYear: 2024, pendingMapping: false },
      },
      {
        user: { userId: 'STU005', name: 'Evan Foster', email: 'evan@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ME', semester: 4, section: 'A', classId: savedClasses[3]._id, admissionYear: 2022, pendingMapping: false },
      },
      {
        user: { userId: 'STU006', name: 'Fiona Green', email: 'fiona@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 5, section: 'B', classId: savedClasses[4]._id, admissionYear: 2021, pendingMapping: false },
      },
      {
        user: { userId: 'STU007', name: 'George Hill', email: 'george@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'EE', semester: 6, section: 'A', classId: savedClasses[5]._id, admissionYear: 2020, pendingMapping: false },
      },
      {
        user: { userId: 'STU008', name: 'Hannah Ives', email: 'hannah@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 3, section: 'A', classId: savedClasses[1]._id, admissionYear: 2023, pendingMapping: false },
      },
      {
        user: { userId: 'STU009', name: 'Ian James', email: 'ian@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ECE', semester: 2, section: 'B', classId: savedClasses[2]._id, admissionYear: 2024, pendingMapping: false },
      },
      {
        user: { userId: 'STU010', name: 'Julia King', email: 'julia@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ME', semester: 4, section: 'A', classId: savedClasses[3]._id, admissionYear: 2022, pendingMapping: false },
      },
      {
        user: { userId: 'STU011', name: 'Kevin Lee', email: 'kevin@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'CSE', semester: 6, section: 'A', classId: savedClasses[6]._id, admissionYear: 2020, pendingMapping: false },
      },
      {
        user: { userId: 'STU012', name: 'Laura Martin', email: 'laura@example.com', password: 'student123', role: 'student' },
        profile: { branch: 'ECE', semester: 4, section: 'B', classId: savedClasses[7]._id, admissionYear: 2022, pendingMapping: false },
      },
    ];
    const savedStudents = [];
    for (const { user, profile } of studentData) {
      const student = new User(user);
      const saved = await student.save();
      await StudentProfile.create({ user: saved._id, ...profile });
      savedStudents.push(saved);
    }
    // Update classes with student IDs
    await Promise.all([
      Class.findByIdAndUpdate(savedClasses[0]._id, { $set: { students: [savedStudents[2]._id] } }),
      Class.findByIdAndUpdate(savedClasses[1]._id, { $set: { students: [savedStudents[0]._id, savedStudents[1]._id, savedStudents[7]._id] } }),
      Class.findByIdAndUpdate(savedClasses[2]._id, { $set: { students: [savedStudents[3]._id, savedStudents[8]._id] } }),
      Class.findByIdAndUpdate(savedClasses[3]._id, { $set: { students: [savedStudents[4]._id, savedStudents[9]._id] } }),
      Class.findByIdAndUpdate(savedClasses[4]._id, { $set: { students: [savedStudents[5]._id] } }),
      Class.findByIdAndUpdate(savedClasses[5]._id, { $set: { students: [savedStudents[6]._id] } }),
      Class.findByIdAndUpdate(savedClasses[6]._id, { $set: { students: [savedStudents[10]._id] } }),
      Class.findByIdAndUpdate(savedClasses[7]._id, { $set: { students: [savedStudents[11]._id] } }),
    ]);
    console.log('Students seeded and classes updated');

    // Teaching Assignments
    const teachingAssignments = [
      { faculty: savedFaculty[0]._id, subject: savedSubjects[0]._id, class: savedClasses[0]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC001: CS101 in CS101-A
      { faculty: savedFaculty[0]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC001: CS302 in CS301-A
      { faculty: savedFaculty[0]._id, subject: savedSubjects[13]._id, class: savedClasses[1]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC001: CS303 in CS301-A
      { faculty: savedFaculty[1]._id, subject: savedSubjects[5]._id, class: savedClasses[2]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC002: EC202 in EC201-B
      { faculty: savedFaculty[1]._id, subject: savedSubjects[6]._id, class: savedClasses[2]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC002: EC301 in EC201-B
      { faculty: savedFaculty[1]._id, subject: savedSubjects[14]._id, class: savedClasses[7]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC002: EC402 in EC401-B
      { faculty: savedFaculty[2]._id, subject: savedSubjects[7]._id, class: savedClasses[3]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC003: ME401 in ME401-A
      { faculty: savedFaculty[2]._id, subject: savedSubjects[8]._id, class: savedClasses[4]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC003: ME501 in CS501-B
      { faculty: savedFaculty[2]._id, subject: savedSubjects[15]._id, class: savedClasses[3]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC003: ME601 in ME401-A
      { faculty: savedFaculty[3]._id, subject: savedSubjects[9]._id, class: savedClasses[5]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC004: EE601 in EE601-A
      { faculty: savedFaculty[3]._id, subject: savedSubjects[11]._id, class: savedClasses[3]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC004: EE401 in ME401-A
      { faculty: savedFaculty[4]._id, subject: savedSubjects[4]._id, class: savedClasses[4]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC005: CS502 in CS501-B
      { faculty: savedFaculty[4]._id, subject: savedSubjects[10]._id, class: savedClasses[6]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC005: CS601 in CS601-A
      { faculty: savedFaculty[5]._id, subject: savedSubjects[12]._id, class: savedClasses[4]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC006: CS503 in CS501-B
      { faculty: savedFaculty[5]._id, subject: savedSubjects[13]._id, class: savedClasses[6]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC006: CS303 in CS601-A
      { faculty: savedFaculty[6]._id, subject: savedSubjects[14]._id, class: savedClasses[7]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC007: EC402 in EC401-B
      { faculty: savedFaculty[6]._id, subject: savedSubjects[6]._id, class: savedClasses[7]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC007: EC301 in EC401-B
      { faculty: savedFaculty[7]._id, subject: savedSubjects[15]._id, class: savedClasses[5]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC008: ME601 in EE601-A
      { faculty: savedFaculty[7]._id, subject: savedSubjects[7]._id, class: savedClasses[3]._id, feedbackPeriod: savedFeedbackPeriods[0]._id, ratingParameters: savedRatingParameters.map(p => p._id) }, // FAC008: ME401 in ME401-A
    ];
    const savedTeachingAssignments = await TeachingAssignment.insertMany(teachingAssignments);
    console.log('Teaching Assignments seeded');

    // Aggregated Ratings
    const aggregatedRatings = [
      // Assignment 1: FAC001 teaching CS101 in CS101-A (complete feedback from 5 students)
      {
        teachingAssignment: savedTeachingAssignments[0]._id,
        ratingParameter: savedRatingParameters[0]._id, // PUNCTUALITY
        totalResponses: 5,
        ratingSum: 20,
        averageRating: 4.0,
      },
      {
        teachingAssignment: savedTeachingAssignments[0]._id,
        ratingParameter: savedRatingParameters[1]._id, // KNOWLEDGE
        totalResponses: 5,
        ratingSum: 22,
        averageRating: 4.4,
      },
      {
        teachingAssignment: savedTeachingAssignments[0]._id,
        ratingParameter: savedRatingParameters[2]._id, // ENGAGEMENT
        totalResponses: 5,
        ratingSum: 18,
        averageRating: 3.6,
      },
      {
        teachingAssignment: savedTeachingAssignments[0]._id,
        ratingParameter: savedRatingParameters[3]._id, // CLARITY
        totalResponses: 5,
        ratingSum: 21,
        averageRating: 4.2,
      },
      {
        teachingAssignment: savedTeachingAssignments[0]._id,
        ratingParameter: savedRatingParameters[4]._id, // SUPPORT
        totalResponses: 5,
        ratingSum: 19,
        averageRating: 3.8,
      },
      // Assignment 2: FAC001 teaching CS302 in CS301-A (partial feedback, 3 parameters from 3 students)
      {
        teachingAssignment: savedTeachingAssignments[1]._id,
        ratingParameter: savedRatingParameters[0]._id, // PUNCTUALITY
        totalResponses: 3,
        ratingSum: 12,
        averageRating: 4.0,
      },
      {
        teachingAssignment: savedTeachingAssignments[1]._id,
        ratingParameter: savedRatingParameters[1]._id, // KNOWLEDGE
        totalResponses: 3,
        ratingSum: 13,
        averageRating: 4.33,
      },
      {
        teachingAssignment: savedTeachingAssignments[1]._id,
        ratingParameter: savedRatingParameters[2]._id, // ENGAGEMENT
        totalResponses: 3,
        ratingSum: 11,
        averageRating: 3.67,
      },
      // Assignment 3: FAC001 teaching CS303 in CS301-A (complete feedback from 4 students)
      {
        teachingAssignment: savedTeachingAssignments[2]._id,
        ratingParameter: savedRatingParameters[0]._id, // PUNCTUALITY
        totalResponses: 4,
        ratingSum: 16,
        averageRating: 4.0,
      },
      {
        teachingAssignment: savedTeachingAssignments[2]._id,
        ratingParameter: savedRatingParameters[1]._id, // KNOWLEDGE
        totalResponses: 4,
        ratingSum: 18,
        averageRating: 4.5,
      },
      {
        teachingAssignment: savedTeachingAssignments[2]._id,
        ratingParameter: savedRatingParameters[2]._id, // ENGAGEMENT
        totalResponses: 4,
        ratingSum: 15,
        averageRating: 3.75,
      },
      {
        teachingAssignment: savedTeachingAssignments[2]._id,
        ratingParameter: savedRatingParameters[3]._id, // CLARITY
        totalResponses: 4,
        ratingSum: 17,
        averageRating: 4.25,
      },
      {
        teachingAssignment: savedTeachingAssignments[2]._id,
        ratingParameter: savedRatingParameters[4]._id, // SUPPORT
        totalResponses: 4,
        ratingSum: 16,
        averageRating: 4.0,
      },
      // Assignment 7: FAC003 teaching ME401 in ME401-A (complete feedback from 6 students)
      {
        teachingAssignment: savedTeachingAssignments[6]._id,
        ratingParameter: savedRatingParameters[0]._id, // PUNCTUALITY
        totalResponses: 6,
        ratingSum: 24,
        averageRating: 4.0,
      },
      {
        teachingAssignment: savedTeachingAssignments[6]._id,
        ratingParameter: savedRatingParameters[1]._id, // KNOWLEDGE
        totalResponses: 6,
        ratingSum: 27,
        averageRating: 4.5,
      },
      {
        teachingAssignment: savedTeachingAssignments[6]._id,
        ratingParameter: savedRatingParameters[2]._id, // ENGAGEMENT
        totalResponses: 6,
        ratingSum: 22,
        averageRating: 3.67,
      },
      {
        teachingAssignment: savedTeachingAssignments[6]._id,
        ratingParameter: savedRatingParameters[3]._id, // CLARITY
        totalResponses: 6,
        ratingSum: 25,
        averageRating: 4.17,
      },
      {
        teachingAssignment: savedTeachingAssignments[6]._id,
        ratingParameter: savedRatingParameters[4]._id, // SUPPORT
        totalResponses: 6,
        ratingSum: 23,
        averageRating: 3.83,
      },
    ];
    await AggregatedRating.insertMany(aggregatedRatings);
    console.log('Aggregated Ratings seeded');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedData();