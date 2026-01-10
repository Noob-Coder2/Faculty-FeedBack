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

// Helper to generate random rating between min and max
const randomRating = (min = 3, max = 5) => Math.floor(Math.random() * (max - min + 1)) + min;

// Sample comments pool
const positiveComments = [
  "Excellent teaching style! Very clear explanations.",
  "Great professor, always helpful and engaging.",
  "Best teacher I've had. Highly recommended!",
  "Very knowledgeable and passionate about the subject.",
  "Amazing lectures, makes complex topics easy to understand.",
  "Wonderful mentor, always available for doubts.",
  "Love the interactive teaching approach!",
];

const neutralComments = [
  "Good overall, could improve on some aspects.",
  "Decent teaching, covers the syllabus well.",
  "Average experience, nothing exceptional.",
  "Satisfactory teaching quality.",
  "Meets expectations for the course.",
];

const constructiveComments = [
  "Could use more practical examples.",
  "Pace is a bit fast sometimes.",
  "More real-world applications would help.",
  "Would appreciate more interactive sessions.",
  "Assignments could be more challenging.",
];

const getRandomComment = (rating) => {
  if (rating >= 4) return positiveComments[Math.floor(Math.random() * positiveComments.length)];
  if (rating >= 3) return neutralComments[Math.floor(Math.random() * neutralComments.length)];
  return constructiveComments[Math.floor(Math.random() * constructiveComments.length)];
};

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

    // ========== CLASSES ==========
    const classes = [
      { name: 'CSE-1A-2024', branch: 'CSE', semester: 1, year: 2024, section: 'A', academicYear: '2024-2025' },
      { name: 'CSE-1B-2024', branch: 'CSE', semester: 1, year: 2024, section: 'B', academicYear: '2024-2025' },
      { name: 'CSE-3A-2024', branch: 'CSE', semester: 3, year: 2024, section: 'A', academicYear: '2024-2025' },
      { name: 'CSE-3B-2024', branch: 'CSE', semester: 3, year: 2024, section: 'B', academicYear: '2024-2025' },
      { name: 'CSE-5A-2024', branch: 'CSE', semester: 5, year: 2024, section: 'A', academicYear: '2024-2025' },
      { name: 'ECE-2A-2024', branch: 'ECE', semester: 2, year: 2024, section: 'A', academicYear: '2024-2025' },
      { name: 'ECE-4A-2024', branch: 'ECE', semester: 4, year: 2024, section: 'A', academicYear: '2024-2025' },
      { name: 'ME-2A-2024', branch: 'ME', semester: 2, year: 2024, section: 'A', academicYear: '2024-2025' },
    ];
    const savedClasses = await Class.insertMany(classes);
    console.log(`✓ ${savedClasses.length} Classes seeded`);

    // ========== SUBJECTS ==========
    const subjects = [
      { subjectCode: 'CS101', subjectName: 'Introduction to Programming', branch: 'CSE', semester: 1 },
      { subjectCode: 'CS102', subjectName: 'Digital Logic', branch: 'CSE', semester: 1 },
      { subjectCode: 'CS201', subjectName: 'Data Structures', branch: 'CSE', semester: 3 },
      { subjectCode: 'CS202', subjectName: 'Object Oriented Programming', branch: 'CSE', semester: 3 },
      { subjectCode: 'CS301', subjectName: 'Database Systems', branch: 'CSE', semester: 3 },
      { subjectCode: 'CS302', subjectName: 'Computer Networks', branch: 'CSE', semester: 5 },
      { subjectCode: 'CS303', subjectName: 'Operating Systems', branch: 'CSE', semester: 5 },
      { subjectCode: 'CS304', subjectName: 'Machine Learning', branch: 'CSE', semester: 5 },
      { subjectCode: 'EC201', subjectName: 'Circuit Theory', branch: 'ECE', semester: 2 },
      { subjectCode: 'EC301', subjectName: 'Digital Electronics', branch: 'ECE', semester: 4 },
      { subjectCode: 'ME201', subjectName: 'Engineering Mechanics', branch: 'ME', semester: 2 },
      { subjectCode: 'ME202', subjectName: 'Thermodynamics', branch: 'ME', semester: 2 },
    ];
    const savedSubjects = await Subject.insertMany(subjects);
    console.log(`✓ ${savedSubjects.length} Subjects seeded`);

    // ========== FEEDBACK PERIODS (3 periods) ==========
    const feedbackPeriods = [
      {
        name: 'Mid-Semester Fall 2024',
        semester: 1,
        year: 2024,
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-30'),
        isActive: false,
        status: 'closed',
      },
      {
        name: 'End-Semester Fall 2024',
        semester: 1,
        year: 2024,
        startDate: new Date('2024-11-15'),
        endDate: new Date('2024-11-30'),
        isActive: false,
        status: 'closed',
      },
      {
        name: 'Mid-Semester Spring 2025',
        semester: 2,
        year: 2025,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
        status: 'active',
      },
    ];
    const savedPeriods = await FeedbackPeriod.insertMany(feedbackPeriods);
    console.log(`✓ ${savedPeriods.length} Feedback Periods seeded`);

    // ========== RATING PARAMETERS ==========
    const ratingParameters = [
      { parameterId: 'PUNCTUALITY', questionText: 'Rate the faculty\'s punctuality', order: 1, isActive: true },
      { parameterId: 'KNOWLEDGE', questionText: 'Rate the faculty\'s subject knowledge', order: 2, isActive: true },
      { parameterId: 'ENGAGEMENT', questionText: 'Rate the faculty\'s engagement with students', order: 3, isActive: true },
      { parameterId: 'CLARITY', questionText: 'Rate the faculty\'s clarity in teaching', order: 4, isActive: true },
      { parameterId: 'SUPPORT', questionText: 'Rate the faculty\'s supportiveness', order: 5, isActive: true },
    ];
    const savedParams = await RatingParameter.insertMany(ratingParameters);
    console.log(`✓ ${savedParams.length} Rating Parameters seeded`);

    // ========== 5 FACULTY MEMBERS ==========
    const facultyData = [
      {
        user: { userId: 'FAC001', name: 'Dr. Jane Smith', email: 'jane.smith@university.edu', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Computer Science', designation: 'Professor', joiningYear: 2015, qualifications: ['PhD', 'MTech'], subjects: [savedSubjects[0]._id, savedSubjects[2]._id, savedSubjects[4]._id] }
      },
      {
        user: { userId: 'FAC002', name: 'Prof. Mark Williams', email: 'mark.williams@university.edu', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Computer Science', designation: 'Associate Professor', joiningYear: 2018, qualifications: ['PhD'], subjects: [savedSubjects[1]._id, savedSubjects[3]._id, savedSubjects[5]._id] }
      },
      {
        user: { userId: 'FAC003', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@university.edu', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Computer Science', designation: 'Assistant Professor', joiningYear: 2020, qualifications: ['PhD'], subjects: [savedSubjects[6]._id, savedSubjects[7]._id] }
      },
      {
        user: { userId: 'FAC004', name: 'Prof. David Chen', email: 'david.chen@university.edu', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Electronics', designation: 'Professor', joiningYear: 2012, qualifications: ['PhD', 'MTech'], subjects: [savedSubjects[8]._id, savedSubjects[9]._id] }
      },
      {
        user: { userId: 'FAC005', name: 'Dr. Emily Brown', email: 'emily.brown@university.edu', password: 'faculty123', role: 'faculty' },
        profile: { department: 'Mechanical', designation: 'Associate Professor', joiningYear: 2017, qualifications: ['PhD'], subjects: [savedSubjects[10]._id, savedSubjects[11]._id] }
      },
    ];
    const savedFaculty = [];
    for (const { user, profile } of facultyData) {
      const faculty = new User(user);
      const saved = await faculty.save();
      await FacultyProfile.create({ user: saved._id, ...profile });
      savedFaculty.push(saved);
    }
    console.log(`✓ ${savedFaculty.length} Faculty members seeded`);

    // ========== 20 STUDENTS ==========
    const studentNames = [
      'Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Wilson', 'Ethan Moore',
      'Fiona Taylor', 'George Anderson', 'Hannah Thomas', 'Ian Jackson', 'Julia White',
      'Kevin Harris', 'Laura Martin', 'Michael Garcia', 'Nancy Martinez', 'Oliver Robinson',
      'Patricia Clark', 'Quincy Lewis', 'Rachel Lee', 'Samuel Walker', 'Tina Hall'
    ];
    const savedStudents = [];
    for (let i = 0; i < 20; i++) {
      const classIndex = i % savedClasses.length;
      const classObj = savedClasses[classIndex];
      const user = new User({
        userId: `STU${String(i + 1).padStart(3, '0')}`,
        name: studentNames[i],
        email: `${studentNames[i].toLowerCase().replace(' ', '.')}@student.edu`,
        password: 'student123',
        role: 'student'
      });
      const saved = await user.save();

      // Assign subjects based on class branch
      let studentSubjects = [];
      if (classObj.branch === 'CSE') {
        studentSubjects = savedSubjects.filter(s => s.branch === 'CSE').slice(0, 3).map(s => s._id);
      } else if (classObj.branch === 'ECE') {
        studentSubjects = savedSubjects.filter(s => s.branch === 'ECE').map(s => s._id);
      } else {
        studentSubjects = savedSubjects.filter(s => s.branch === 'ME').map(s => s._id);
      }

      await StudentProfile.create({
        user: saved._id,
        branch: classObj.branch,
        semester: classObj.semester,
        section: classObj.section,
        classId: classObj._id,
        admissionYear: 2023,
        subjects: studentSubjects,
        status: 'active'
      });
      savedStudents.push(saved);
    }
    console.log(`✓ ${savedStudents.length} Students seeded`);

    // ========== TEACHING ASSIGNMENTS (Faculty -> Subject -> Class -> Period) ==========
    const teachingAssignments = [];

    // Faculty 1 (Dr. Jane Smith) - CSE subjects across all 3 periods
    teachingAssignments.push(
      { faculty: savedFaculty[0]._id, subject: savedSubjects[0]._id, class: savedClasses[0]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[0]._id, subject: savedSubjects[0]._id, class: savedClasses[0]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[0]._id, subject: savedSubjects[0]._id, class: savedClasses[0]._id, feedbackPeriod: savedPeriods[2]._id },
      { faculty: savedFaculty[0]._id, subject: savedSubjects[2]._id, class: savedClasses[2]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[0]._id, subject: savedSubjects[2]._id, class: savedClasses[2]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[0]._id, subject: savedSubjects[2]._id, class: savedClasses[2]._id, feedbackPeriod: savedPeriods[2]._id },
    );

    // Faculty 2 (Prof. Mark Williams)
    teachingAssignments.push(
      { faculty: savedFaculty[1]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[1]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[1]._id, subject: savedSubjects[1]._id, class: savedClasses[1]._id, feedbackPeriod: savedPeriods[2]._id },
      { faculty: savedFaculty[1]._id, subject: savedSubjects[5]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[1]._id, subject: savedSubjects[5]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[1]._id, subject: savedSubjects[5]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[2]._id },
    );

    // Faculty 3 (Dr. Sarah Johnson)
    teachingAssignments.push(
      { faculty: savedFaculty[2]._id, subject: savedSubjects[6]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[2]._id, subject: savedSubjects[6]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[2]._id, subject: savedSubjects[6]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[2]._id },
      { faculty: savedFaculty[2]._id, subject: savedSubjects[7]._id, class: savedClasses[4]._id, feedbackPeriod: savedPeriods[2]._id },
    );

    // Faculty 4 (Prof. David Chen) - ECE
    teachingAssignments.push(
      { faculty: savedFaculty[3]._id, subject: savedSubjects[8]._id, class: savedClasses[5]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[3]._id, subject: savedSubjects[8]._id, class: savedClasses[5]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[3]._id, subject: savedSubjects[8]._id, class: savedClasses[5]._id, feedbackPeriod: savedPeriods[2]._id },
      { faculty: savedFaculty[3]._id, subject: savedSubjects[9]._id, class: savedClasses[6]._id, feedbackPeriod: savedPeriods[2]._id },
    );

    // Faculty 5 (Dr. Emily Brown) - ME
    teachingAssignments.push(
      { faculty: savedFaculty[4]._id, subject: savedSubjects[10]._id, class: savedClasses[7]._id, feedbackPeriod: savedPeriods[0]._id },
      { faculty: savedFaculty[4]._id, subject: savedSubjects[10]._id, class: savedClasses[7]._id, feedbackPeriod: savedPeriods[1]._id },
      { faculty: savedFaculty[4]._id, subject: savedSubjects[10]._id, class: savedClasses[7]._id, feedbackPeriod: savedPeriods[2]._id },
      { faculty: savedFaculty[4]._id, subject: savedSubjects[11]._id, class: savedClasses[7]._id, feedbackPeriod: savedPeriods[2]._id },
    );

    const savedAssignments = await TeachingAssignment.insertMany(teachingAssignments);
    console.log(`✓ ${savedAssignments.length} Teaching Assignments seeded`);

    // ========== FEEDBACK SUBMISSION ==========
    // Map to track aggregated ratings per assignment+parameter
    const aggregatedMap = new Map();
    let feedbackCount = 0;

    // Generate feedback for each period
    for (const assignment of savedAssignments) {
      // Find students in this class
      const classStudents = savedStudents.filter((s, i) => {
        const classIndex = i % savedClasses.length;
        return savedClasses[classIndex]._id.toString() === assignment.class.toString();
      });

      // Each student submits feedback (3-5 students per assignment)
      const numResponses = Math.min(classStudents.length, Math.floor(Math.random() * 3) + 3);

      for (let i = 0; i < numResponses && i < classStudents.length; i++) {
        const student = classStudents[i];
        const baseRating = randomRating(3, 5);

        // Create individual ratings with slight variation
        const ratings = savedParams.map(rp => ({
          ratingParameter: rp._id,
          value: Math.min(5, Math.max(1, baseRating + randomRating(-1, 1)))
        }));

        const feedback = await Feedback.create({
          teachingAssignment: assignment._id,
          student: student._id,
          ratings,
          comment: Math.random() > 0.3 ? getRandomComment(baseRating) : '', // 70% have comments
          submittedAt: new Date(assignment.feedbackPeriod.toString() === savedPeriods[0]._id.toString() ? '2024-09-20' :
            assignment.feedbackPeriod.toString() === savedPeriods[1]._id.toString() ? '2024-11-20' : '2025-01-15')
        });
        feedbackCount++;

        // Update aggregated data
        for (const r of ratings) {
          const key = `${assignment._id}-${r.ratingParameter}`;
          if (!aggregatedMap.has(key)) {
            aggregatedMap.set(key, { sum: 0, count: 0, assignment: assignment._id, param: r.ratingParameter });
          }
          const agg = aggregatedMap.get(key);
          agg.sum += r.value;
          agg.count += 1;
        }
      }
    }
    console.log(`✓ ${feedbackCount} Feedback submissions created`);

    // Create aggregated ratings
    for (const [key, data] of aggregatedMap) {
      await AggregatedRating.create({
        teachingAssignment: data.assignment,
        ratingParameter: data.param,
        totalResponses: data.count,
        ratingSum: data.sum,
        averageRating: parseFloat((data.sum / data.count).toFixed(2))
      });
    }
    console.log(`✓ ${aggregatedMap.size} Aggregated Ratings created`);

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log(`Summary:`);
    console.log(`  - 5 Faculty members (FAC001-FAC005, password: faculty123)`);
    console.log(`  - 20 Students (STU001-STU020, password: student123)`);
    console.log(`  - 3 Feedback Periods (2 closed, 1 active)`);
    console.log(`  - ${savedAssignments.length} Teaching Assignments`);
    console.log(`  - ${feedbackCount} Feedback Submissions`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedData();
