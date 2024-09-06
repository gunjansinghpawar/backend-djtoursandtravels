const VerifiedUser = require('../models/VerifiedUser.js');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');
// Options for JWT strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    // Assuming userId is a simple string in the payload
    const user = await VerifiedUser.findById(jwt_payload.user.id); // Fixed access to user ID
    if (user) {
      return done(null, user);
    } else {
      return done(null, false); // User not found
    }
  } catch (error) {
    console.error('Error in JWT strategy:', error.message);
    return done(error, false); // Return the error to Passport
  }
}));

module.exports = passport;
