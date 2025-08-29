// server/server.js

// import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// import routes
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const adminRoutes = require('./routes/admin');
const facultyRatingsRoutes = require('./routes/faculty-ratings');
const classRoutes = require('./routes/classes');
const subjectRoutes = require('./routes/subjects');
const feedbackPeriodRoutes = require('./routes/feedback-periods');
const teachingAssignmentRoutes = require('./routes/teaching-assignments');
const studentRoutes = require('./routes/student');
const facultyRoutes = require('./routes/faculty');
const profileRoutes = require('./routes/profile');
const changePasswordRoutes = require('./routes/change-password');

// import custom middleware
const auth = require('./middleware/auth');
const checkRole = require('./middleware/role');
const validate = require('./middleware/validate');
const loginLimiter = require('./middleware/ratelimiter');

// import models
require('./models/Class');
require('./models/Subject');
require('./models/TeachingAssignment');
require('./models/FeedbackPeriod');
require('./models/RatingParameter');
require('./models/AggregatedRating');
require('./models/User');
require('./models/StudentProfile');
require('./models/FacultyProfile');

// import utils
const app = express();
const PORT = process.env.PORT || 5001;
const logger = require('./utils/logger');

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-production-domain.com' : 'http://localhost:5173',
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
}));

// Middleware
app.use(cookieParser()); // Add cookie parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize()); // Prevent NoSQL injection - REMOVED due to incompatibility with Express v5

// Routes
app.use('/api/auth/register', registerRoutes);
app.use('/api/auth/login', loginLimiter, loginRoutes);
app.use('/api/admin', auth, checkRole(['admin']), adminRoutes);
app.use('/api/admin/classes', auth, checkRole(['admin']), classRoutes);
app.use('/api/admin/subjects', auth, checkRole(['admin']), subjectRoutes);
app.use('/api/admin/feedback-periods', auth, checkRole(['admin']), feedbackPeriodRoutes);
app.use('/api/admin/teaching-assignments', auth, checkRole(['admin']), teachingAssignmentRoutes);
app.use('/api/student', auth, checkRole(['student']), studentRoutes);
app.use('/api/faculty', auth, checkRole(['faculty']), facultyRoutes);
app.use('/api/admin/faculty-ratings', auth, checkRole(['admin']), facultyRatingsRoutes);
app.use('/api/auth', profileRoutes);
app.use('/api/user', auth, changePasswordRoutes);

// Add logout route
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.errorWithContext('JSON Parse Error', req, { error: err.message });
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  logger.errorWithContext('Unhandled server error', req, {
    error: err.message,
    stack: err.stack,
    name: err.name
  });

  // Don't expose stack traces in production
  const response = {
    message: process.env.NODE_ENV === 'production' ?
      'An unexpected error occurred' :
      err.message || 'Server error'
  };

  res.status(err.status || 500).json(response);
});

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

// Check for MongoDB URI
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  logger.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// Connect to MongoDB Atlas with improved error handling
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds
})
.then(() => {
  logger.info('Successfully connected to MongoDB Atlas!');
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
})
.catch(err => {
  logger.error('MongoDB connection error', {
    error: err.message,
    stack: err.stack,
    code: err.code
  });
  process.exit(1);
});

// Monitor for MongoDB connection issues
mongoose.connection.on('error', err => {
  logger.error('MongoDB connection error:', {
    error: err.message,
    stack: err.stack,
    code: err.code
  });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully');
});

app.get('/', (req, res) => {
  res.send('Faculty Feedback System Backend is Running!');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});
