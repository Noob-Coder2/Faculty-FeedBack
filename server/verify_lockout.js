const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './server/.env' });

const runVerification = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        // Cleanup previous test user
        await User.deleteOne({ userId: 'test_lockout_user' });

        // Create test user
        const user = new User({
            userId: 'test_lockout_user',
            name: 'Test Lockout User',
            email: 'test_lockout@example.com',
            password: 'Password123!',
            role: 'student'
        });
        await user.save();
        console.log('Test user created');

        // Simulate Login Logic (since we can't easily hit the API from here without running the server)
        // We will replicate the logic from login.js

        const attemptLogin = async (password) => {
            const u = await User.findOne({ userId: 'test_lockout_user' });

            if (u.lockUntil && u.lockUntil > Date.now()) {
                console.log('Login Result: LOCKED');
                return 'LOCKED';
            }

            const isMatch = await bcrypt.compare(password, u.password);
            if (!isMatch) {
                u.failedLoginAttempts += 1;
                if (u.failedLoginAttempts >= 5) {
                    u.lockUntil = Date.now() + 15 * 60 * 1000;
                    console.log('Account LOCKED due to failed attempts');
                }
                await u.save();
                console.log(`Login Result: FAILED (Attempts: ${u.failedLoginAttempts})`);
                return 'FAILED';
            }

            u.failedLoginAttempts = 0;
            u.lockUntil = undefined;
            u.lastLogin = Date.now();
            await u.save();
            console.log('Login Result: SUCCESS');
            return 'SUCCESS';
        };

        // 1. Successful Login
        console.log('\n--- Test 1: Successful Login ---');
        await attemptLogin('Password123!');
        const u1 = await User.findOne({ userId: 'test_lockout_user' });
        if (u1.lastLogin) console.log('PASS: lastLogin updated');
        else console.log('FAIL: lastLogin not updated');

        // 2. Failed Logins (Lockout)
        console.log('\n--- Test 2: Lockout Logic ---');
        for (let i = 1; i <= 5; i++) {
            console.log(`Attempt ${i}:`);
            await attemptLogin('WrongPass');
        }

        // 3. Login while locked
        console.log('\n--- Test 3: Login while locked ---');
        const res = await attemptLogin('Password123!'); // Correct password but should be locked
        if (res === 'LOCKED') console.log('PASS: Account is locked');
        else console.log('FAIL: Account should be locked');

        // Cleanup
        await User.deleteOne({ userId: 'test_lockout_user' });
        console.log('\nTest user deleted');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification Error:', error);
        await mongoose.disconnect();
    }
};

runVerification();
