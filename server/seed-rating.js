// server/seed-rating.js
const mongoose = require('mongoose');
require('./models/RatingParameter');
require('dotenv').config();
const RatingParameter = mongoose.model('RatingParameter');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB for seeding rating parameters'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Seed function
const seedRatingParameters = async () => {
    try {
        // Clear existing rating parameters
        await RatingParameter.deleteMany({});
        console.log('Cleared existing rating parameters');

        // Define the 5 fixed rating parameters
        const parameters = [
            { name: 'Punctuality', questionText: 'Rate the faculty\'s punctuality.' },
            { name: 'Knowledge', questionText: 'Rate the faculty\'s subject knowledge.' },
            { name: 'Engagement', questionText: 'Rate the faculty\'s engagement with students.' },
            { name: 'Clarity', questionText: 'Rate the clarity of the faculty\'s explanations.' },
            { name: 'Support', questionText: 'Rate the support provided by the faculty outside of class.' },
        ].map((param, index) => ({
            parameterId: param.name.toUpperCase(), // Convert name to uppercase for parameterId
            questionText: param.questionText,
            order: index + 1, // Set order based on index
        })
    );

        // Insert the parameters
        const insertedParameters = await RatingParameter.insertMany(parameters);
        console.log('Rating parameters seeded successfully:', insertedParameters);

        // Verify count
        const count = await RatingParameter.countDocuments();
        if (count !== 5) {
            throw new Error('Expected 5 rating parameters, but seeded ' + count);
        }
        console.log('Verified: Exactly 5 rating parameters in the database');
    } catch (error) {
        console.error('Error seeding rating parameters:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    }
};

// Run the seed function
seedRatingParameters();