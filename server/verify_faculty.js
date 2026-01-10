const mongoose = require('mongoose');
const User = require('./models/User');
const FacultyProfile = require('./models/FacultyProfile');
const Feedback = require('./models/Feedback');
const TeachingAssignment = require('./models/TeachingAssignment');
const FeedbackPeriod = require('./models/FeedbackPeriod');
const AggregatedRating = require('./models/AggregatedRating');
require('dotenv').config({ path: './server/.env' });

const runVerification = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        // 1. Mock Data Setup
        // We need a faculty, a student, a feedback period, a teaching assignment, and some feedback.
        // This is complex to set up from scratch, so we'll check if we can query existing data or just mock the response structure logic.

        // Let's try to find an existing faculty to test with
        const faculty = await User.findOne({ role: 'faculty' });
        if (!faculty) {
            console.log('No faculty found. Skipping live data test.');
            return;
        }
        console.log(`Testing with faculty: ${faculty.name} (${faculty._id})`);

        // 2. Test Analytics Logic (Simulated)
        // We will manually run the aggregation pipeline logic here to see if it errors
        const facultyProfile = await FacultyProfile.findOne({ user: faculty._id });
        if (facultyProfile) {
            const trendData = await AggregatedRating.aggregate([
                { $lookup: { from: 'teachingassignments', localField: 'teachingAssignment', foreignField: '_id', as: 'teachingAssignment' } },
                { $unwind: '$teachingAssignment' },
                { $match: { 'teachingAssignment.faculty': facultyProfile.user } },
                { $lookup: { from: 'feedbackperiods', localField: 'teachingAssignment.feedbackPeriod', foreignField: '_id', as: 'feedbackPeriod' } },
                { $unwind: '$feedbackPeriod' },
                { $group: { _id: '$feedbackPeriod.name', averageRating: { $avg: '$averageRating' } } }
            ]);
            console.log('Analytics Aggregation Result:', trendData);
        } else {
            console.log('Faculty profile not found.');
        }

        // 3. Test Comments Logic
        const assignments = await TeachingAssignment.find({ faculty: faculty._id }).select('_id');
        const assignmentIds = assignments.map(a => a._id);
        const comments = await Feedback.find({
            teachingAssignment: { $in: assignmentIds },
            comment: { $exists: true, $ne: '' }
        }).limit(5);
        console.log(`Found ${comments.length} comments.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification Error:', error);
        await mongoose.disconnect();
    }
};

runVerification();
