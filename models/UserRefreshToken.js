const mongoose = require('mongoose');

const userRefreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60, // 7 days in seconds
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    revokedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('UserRefreshToken', userRefreshTokenSchema);
