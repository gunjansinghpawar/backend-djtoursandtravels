const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.MONGODB_URI;

const connectDb = async () => {
    try {
        await mongoose.connect(db);
            console.log('Connected to MongoDB');
        }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDb;