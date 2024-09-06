const jwt = require('jsonwebtoken');
const UserRefreshToken = require('../models/UserRefreshToken');

const verifyRefreshToken = async (refreshToken) => {
    try {
        // Retrieve the private key from the environment variables
        const privateKey = process.env.JWT_REFRESH_SECRET;

        // Check if the refresh token exists in the database
        const userRefreshToken = await UserRefreshToken.findOne({ refreshToken });
        if (!userRefreshToken) {
            throw new Error('Invalid refresh token');
        }

        // Verify the refresh token
        const payload = jwt.verify(refreshToken, privateKey);
        
        // Check if the userId is present in the payload
        if (!payload.userId) {
            throw new Error('Invalid refresh token');
        }

        // Return the userId from the payload
        return payload.userId;
    } catch (error) {
        console.error('Error verifying refresh token:', error.message);
        throw new Error('Invalid refresh token');
    }
};

module.exports = verifyRefreshToken;
