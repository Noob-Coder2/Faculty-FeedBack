// server/get_reset_token.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const getResetToken = async () => {
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

        console.log('START_FETCH');
        const email = 'test@example.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`USER_FOUND: ${user.email}`);
            if (user.resetPasswordToken) {
                console.log(`RESET_TOKEN: ${user.resetPasswordToken}`);
                console.log(`RESET_LINK: http://localhost:5173/reset-password/${user.resetPasswordToken}`);
            } else {
                console.log('NO_TOKEN_FOUND');
            }
        } else {
            console.log('USER_NOT_FOUND');
        }
        console.log('END_FETCH');
        process.exit(0);
    } catch (error) {
        console.error('Error fetching token:', error);
        process.exit(1);
    }
};

getResetToken();
