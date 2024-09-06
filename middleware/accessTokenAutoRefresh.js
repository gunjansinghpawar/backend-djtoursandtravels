const { jwtAccessToken, generateRefreshToken } = require('../utils/generateToken');
const setTokenCookies = require('../utils/setTokenCookies');
const jwt = require('jsonwebtoken');

const accessTokenAutoRefresh = async (req, res, next) => {
    try {
        console.log('Cookies:', req.cookies);

        // Retrieve the access token from cookies
        const accessToken = req.cookies.jwtAccessToken; // Make sure the cookie name is correct

        // Log the access token for debugging purposes
        console.log('Access Token:', accessToken);

        // If there's no access token, return unauthorized
        if (!accessToken) {
            console.warn('No access token found, unauthorized access');
            return res.status(401).json({ message: 'Unauthorized: No access token found' });
        }

        // Decode the token to get its payload
        const decodedToken = jwt.decode(accessToken);

        if (!decodedToken) {
            console.error('Token could not be decoded');
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Check if the token has an expiration time
        if (!decodedToken.exp) {
            console.error('Decoded token does not have an exp field:', decodedToken);
            return res.status(401).json({ message: 'Unauthorized: Invalid token structure' });
        }
        // Get the current time in seconds
        const currentTime = Math.floor(Date.now() / 1000);
        console.log('Token expiration time:', decodedToken.exp);
        console.log('Current time:', currentTime);

        // Check if the token is expired
        if (currentTime > decodedToken.exp) {
            console.warn('Unauthorized: Token has expired');

            // Try to refresh the token
            const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies
            if (!refreshToken) {
                return res.status(401).json({ message: 'Unauthorized: Refresh token not found' });
            }

            // Verify and refresh the access token
            try {
                const verifiedUser = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                console.log('Verified User:', verifiedUser); // Ensure userId is present

                // Extract user object from verifiedUser
                const user = verifiedUser.user;

                if (!user.id) {
                    throw new Error('User ID is missing from the token');
                }

                const newAccessToken = jwtAccessToken(user); // Generate a new access token
                const newRefreshToken = await generateRefreshToken(user); // Generate a new refresh token

                // Set the new tokens as cookies
                setTokenCookies(res, newAccessToken, newRefreshToken);

                // Set the new access token in the authorization header
                req.headers['authorization'] = `Bearer ${newAccessToken}`;
                console.log('Authorization header set with new access token:', req.headers['authorization']);
            } catch (refreshError) {
                console.error('Failed to get refresh access token:', refreshError.message);
                return res.status(401).json({ message: 'Unauthorized: Invalid refresh token' });
            }

        } else {
            // If the token is valid, set the authorization header with the Bearer token
            req.headers['authorization'] = `Bearer ${accessToken}`;
            console.log('Authorization header set:', req.headers['authorization']); // Log the header for debugging
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error in accessTokenAutoRefresh:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = accessTokenAutoRefresh;
