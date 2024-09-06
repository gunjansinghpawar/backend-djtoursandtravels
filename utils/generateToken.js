const jwt = require('jsonwebtoken');
require('dotenv').config();
const UserRefreshToken = require('../models/UserRefreshToken');

const jwtAccessToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role,
        },
        iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10s' });
};

const generateRefreshToken = async (user) => {
    try {
        await UserRefreshToken.deleteMany({ userId: user.id });

        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
            iat: Math.floor(Date.now() / 1000),
        };
        const newToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        const tokenDoc = new UserRefreshToken({
            userId: user.id,
            refreshToken: newToken,
        });
        await tokenDoc.save();

        return newToken;
    } catch (error) {
        console.error('Error generating refresh token:', error.message);
        throw new Error('Could not generate refresh token');
    }
};

module.exports = { jwtAccessToken, generateRefreshToken };
