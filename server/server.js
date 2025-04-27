const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

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

const auth = require('./middleware/auth');
const checkRole = require('./middleware/role');
const validate = require('./middleware/validate');
const loginLimiter = require('./middleware/ratelimiter');

require('./models/Class');
require('./models/Subject');
require('./models/TeachingAssignment');
require('./models/FeedbackPeriod');
require('./models/RatingParameter');
require('./models/AggregatedRating');
require('./models/User');
require('./models/StudentProfile');
require('./models/FacultyProfile');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// Log parsed body *after* express.json()
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  console.log('Raw Request Body:', req.body ? JSON.stringify(req.body) : 'Empty');
  next();
});

app.use('/api/auth/register', registerRoutes);
app.use('/api/auth/login', loginLimiter, loginRoutes);
app.use('/api/admin', auth, checkRole(['admin']), adminRoutes);
app.use('/api/admin/classes', auth, checkRole(['admin']), classRoutes);
app.use('/api/admin/subjects', auth, checkRole(['admin']), subjectRoutes);
app.use('/api/admin/feedback-periods', auth, checkRole(['admin']), feedbackPeriodRoutes);
app.use('/api/admin/teaching-assignments', auth, checkRole(['admin']), teachingAssignmentRoutes);
app.use('/api/student', auth, checkRole(['student']), studentRoutes);
app.use('/api/faculty', auth, checkRole(['faculty']), facultyRoutes);
app.use('/api/admin/faculty-ratings', facultyRatingsRoutes);
app.use('/api/auth', profileRoutes);

app.get('/api/test/admin', auth, checkRole(['admin']), (req, res) => {
  res.json({ message: 'Welcome, admin!', user: req.user });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('Faculty Feedback System Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});