// server/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const FacultyProfile = require('./models/FacultyProfile');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const FeedbackPeriod = require('./models/FeedbackPeriod');
const RatingParameter = require('./models/RatingParameter');

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
      User.deleteMany({ role: { $ne: 'admin' } }),
    ]);
    console.log('Non-admin data cleared');

    const classes = [
      { name: 'CS101', branch: 'CSE', semester: '1', year: 2025, section: 'A', academicYear: '2024-2025' },
      { name: 'CS301', branch: 'CSE', semester: '3', year: 2025, section: 'A', academicYear: '2024-2025' },
    ];
    const savedClasses = await Class.insertMany(classes);
    console.log('Classes seeded');

    const subjects = [
      { subjectCode: 'CS101', subjectName: 'Introduction to Programming', branch: 'CSE', semester: 1 },
      { subjectCode: 'CS302', subjectName: 'Database Systems', branch: 'CSE', semester: 3 },
    ];
    await Subject.insertMany(subjects);
    console.log('Subjects seeded');

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
    await FeedbackPeriod.insertMany(feedbackPeriods);
    console.log('Feedback Periods seeded');

    const ratingParameters = [
      { parameterId: 'PUNCTUALITY', questionText: 'Rate the faculty’s punctuality', order: 1 },
      { parameterId: 'KNOWLEDGE', questionText: 'Rate the faculty’s subject knowledge', order: 2 },
      { parameterId: 'ENGAGEMENT', questionText: 'Rate the faculty’s engagement with students', order: 3 },
      { parameterId: 'CLARITY', questionText: 'Rate the faculty’s clarity in teaching', order: 4 },
      { parameterId: 'SUPPORT', questionText: 'Rate the faculty’s supportiveness', order: 5 },
    ];
    await RatingParameter.insertMany(ratingParameters);
    console.log('Rating Parameters seeded');

    const faculty = new User({
      userId: 'FAC001',
      name: 'Dr. Jane Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'faculty',
    });
    const savedFaculty = await faculty.save();
    await FacultyProfile.create({
      user: savedFaculty._id,
      department: 'Computer Science',
      designation: 'Professor',
      joiningYear: 2015,
      qualifications: ['PhD'],
    });
    console.log('Faculty seeded');

    const student1 = new User({
      userId: 'STU001',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
    });
    const savedStudent1 = await student1.save();
    await StudentProfile.create({
      user: savedStudent1._id,
      branch: 'CSE',
      semester: 3,
      section: 'A',
      classId: savedClasses[1]._id, // CS301
      admissionYear: 2023,
      pendingMapping: false,
    });

    const student2 = new User({
      userId: 'STU002',
      name: 'Bob Brown',
      email: 'bob@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
    });
    const savedStudent2 = await student2.save();
    await StudentProfile.create({
      user: savedStudent2._id,
      branch: 'CSE',
      semester: 3,
      section: 'A',
      admissionYear: 2023,
      pendingMapping: true,
    });
    console.log('Students seeded');

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedData();