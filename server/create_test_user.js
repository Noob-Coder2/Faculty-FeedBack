// server/create_test_user.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URI;
        if (!MONGO_URI) {
            console.error('MONGODB_URI is missing');
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const email = 'test@example.com';
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists, deleting...');
            await User.deleteOne({ email });
        }

        const user = new User({
            userId: 'testuser1',
            name: 'Test User',
            email: email,
            password: 'Strong@123', // Will be hashed by pre-save hook
            role: 'student',
        });

        await user.save();
        console.log('Test user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser();
