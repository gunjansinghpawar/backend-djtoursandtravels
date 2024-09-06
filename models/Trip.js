const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{10}$/ // Validates a 10-digit phone number
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    vehicleNo: {
        type: String,
        required: true,
        trim: true
    },
    vehicleType: {
        type: String,
        required: true,
        trim: true,
        enum: ['Sedan', 'SUV', 'Hatchback', 'Van', 'Bus'] // Example options
    },
    driverName: {
        type: String,
        required: true,
        trim: true
    },
    acType: {
        type: String,
        required: true,
        enum: ['A/C', 'Non A/C'] // A/C or Non A/C
    },
    startingKm: {
        type: Number,
        required: true,
        min: 0
    },
    endingKm: {
        type: Number,
        required: true,
        min: 0
    },
    reportedTime: {
        type: Date,
        required: true
    },
    releasedTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    tollAmount: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model('Trip', tripSchema);
