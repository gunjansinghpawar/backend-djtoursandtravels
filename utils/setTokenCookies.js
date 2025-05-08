const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('jwtAccessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });
};

module.exports = setTokenCookies;
