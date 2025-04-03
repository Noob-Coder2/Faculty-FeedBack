// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file
const registerRoutes = require('./routes/register'); // Import registration routes
const loginRoutes = require('./routes/login'); // Import login routes

require('./models/Class');
require('./models/Subject');
require('./models/TeachingAssignment');
require('./models/FeedbackPeriod');
require('./models/FeedbackSubmissionStatus');
require('./models/RatingParameter');
require('./models/AggregatedRating');
require('./models/User'); // Import the User model
require('./models/StudentProfile');
require('./models/FacultyProfile');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001; // Use port from env file or default to 5001

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

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
app.get('/', (req, res) => res.send('Faculty Feedback System Backend is Running!'));
app.use('/api/auth/register', registerRoutes); // Mount register routes
app.use('/api/auth/login', loginRoutes); // Mount login routes

// --- Add a basic error handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

