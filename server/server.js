// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Import routes
const registerRoutes = require('./routes/register'); // Import registration routes
const loginRoutes = require('./routes/login'); // Import login routes
const adminRoutes = require('./routes/admin');
const classRoutes = require('./routes/classes');
const subjectRoutes = require('./routes/subjects');
const feedbackPeriodRoutes = require('./routes/feedback-periods');
const teachingAssignmentRoutes = require('./routes/teaching-assignments');
const studentRoutes = require('./routes/student');
const facultyRoutes = require('./routes/faculty');

// Import middleware
const auth = require('./middleware/auth');
const checkRole = require('./middleware/role');
const validate = require('./middleware/validate');
const loginLimiter = require('./middleware/ratelimiter');

// Import models
require('./models/Class');
require('./models/Subject');
require('./models/TeachingAssignment');
require('./models/FeedbackPeriod');
require('./models/FeedbackSubmissionStatus');
require('./models/RatingParameter');
require('./models/AggregatedRating');
require('./models/User');
require('./models/StudentProfile');
require('./models/FacultyProfile');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001; // Use port from env file or default to 5001

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use('/api/admin', auth, checkRole(['admin']), adminRoutes);
app.use('/api/admin/classes', auth, checkRole(['admin']), classRoutes);
app.use('/api/admin/subjects', auth, checkRole(['admin']), subjectRoutes);
app.use('/api/admin/feedback-periods', auth, checkRole(['admin']), feedbackPeriodRoutes);
app.use('/api/admin/teaching-assignments', auth, checkRole(['admin']), teachingAssignmentRoutes);
app.use('/api/student', auth, checkRole(['student']), studentRoutes);
app.use('/api/faculty', auth, checkRole(['faculty']), facultyRoutes);
app.use('/api/auth/login', loginLimiter, loginRoutes);


// --- JWT Key Check ---
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
    process.exit(1); // Exit the application if JWT secret is missing
}

// --- Database Connection ---
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGODB_URI environment variable is not set.");
    process.exit(1); // Exit the application if connection string is missing
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if connection fails
    });

// --- Basic Routes ---
app.get('/', (req, res) => {
    res.send('Faculty Feedback System Backend is Running!');
});

// --- API Routes --- 
app.use('/api/auth/register', registerRoutes); // Mount register routes
app.use('/api/auth/login', loginRoutes); // Mount login routes

// Example protected route (we’ll add more later)
app.get('/api/test/admin', auth, checkRole(['admin']), (req, res) => {
    res.json({ message: 'Welcome, admin!', user: req.user });
});

// --- Add a basic error handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

