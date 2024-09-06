const jwt = require('jsonwebtoken');
const verifyRefreshToken = require('../utils/verifyOldRefreshToken');
const { jwtAccessToken, jwtRefreshToken } = require('../utils/generateToken');
const VerifiedUser = require('../models/VerifiedUser');
const UserRefreshToken = require('../models/UserRefreshToken');

const newRefreshToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        // Check for the presence of the refresh token
        if (!oldRefreshToken) {
            return res.status(400).json({ message: 'No Refresh Token provided.' });
        }

        // Verify the old refresh token and get the payload
        const payload = await verifyRefreshToken(oldRefreshToken);
        if (!payload || !payload.userId) {
            return res.status(401).json({ message: 'Invalid Refresh Token.' });
        }

        // Find the user associated with the payload
        const user = await VerifiedUser.findById(payload.userId);
        if (!user) { 
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the refresh token exists in the database
        const tokenDoc = await UserRefreshToken.findOne({ refreshToken: oldRefreshToken });
        if (!tokenDoc || tokenDoc.isRevoked) {
            return res.status(401).json({ message: 'Refresh token is invalid or has been revoked.' });
        }

        // Revoke the old refresh token
        tokenDoc.isRevoked = true;
        await tokenDoc.save();

        // Generate new access and refresh tokens
        const newAccessToken = jwtAccessToken(user);
        const newRefreshAccessToken = jwtRefreshToken(user); // Create a new refresh token

        // Save the new refresh token to the database
        const newTokenDoc = new UserRefreshToken({ refreshToken: newRefreshAccessToken, userId: user._id });
        await newTokenDoc.save();
        setTokenCookies(res, newAccessToken, newRefreshAccessToken);
        // Return the new tokens
        return res.status(200).json({ newAccessToken, newRefreshAccessToken });
    } catch (error) {
        console.error('Error creating new refresh token:', error.message);
        return res.status(500).json({ message: 'Error creating token: ' + error.message });
    }
};

module.exports = newRefreshToken;
