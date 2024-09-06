const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiredAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000), // 55 minutes
    },
});

const Otp = mongoose.model('Otp', OtpSchema);
module.exports = Otp;
