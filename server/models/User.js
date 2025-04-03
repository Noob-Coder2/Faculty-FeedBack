// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        trim: true // Removes whitespace from both ends
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true, // Converts email to lowercase
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] // Basic email format validation
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'] // Example: Enforce minimum length
    },
    role: {
        type: String,
        required: true,
        enum: {
            values: ['student', 'faculty', 'admin'],
            message: '{VALUE} is not a supported role' // Error message if role is invalid
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
});

// --- Mongoose Middleware: Hash password before saving ---
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt (complexity factor - 10 is a good default)
        const salt = await bcrypt.genSalt(10);
        // Hash the password using the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Pass error to the next middleware/error handler
    }
});

// --- Instance Method: Compare entered password with hashed password ---
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;