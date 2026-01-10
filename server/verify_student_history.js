const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' }); // Adjust path if running from root
const User = require('./models/User');
const Feedback = require('./models/Feedback');
const StudentProfile = require('./models/StudentProfile');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faculty_feedback_db';

async function verifyStudentHistory() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find a student user
        const studentUser = await User.findOne({ role: 'student' });
        if (!studentUser) {
            console.log('No student user found.');
            return;
        }
        console.log(`Testing with student: ${studentUser.name} (${studentUser._id})`);

        // 2. Check if they have any feedback
        const feedbackCount = await Feedback.countDocuments({ student: studentUser._id });
        console.log(`Found ${feedbackCount} feedback submissions for this student.`);

        if (feedbackCount > 0) {
            // 3. Fetch history as the endpoint would
            const history = await Feedback.find({ student: studentUser._id })
                .populate({
                    path: 'teachingAssignment',
                    populate: { path: 'faculty subject feedbackPeriod', select: 'name subjectName name' }
                })
                .sort({ submittedAt: -1 });

            console.log('History Items:');
            history.forEach(h => {
                console.log(`- [${h.teachingAssignment.feedbackPeriod.name}] ${h.teachingAssignment.subject.subjectName} (Faculty: ${h.teachingAssignment.faculty.name})`);
                console.log(`  Ratings: ${h.ratings.map(r => r.value).join(', ')}`);
                if (h.comment) console.log(`  Comment: "${h.comment}"`);
            });
        } else {
            console.log('Skipping history check as no feedback exists.');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyStudentHistory();
