const express = require('express');
const {
    createUser,
    emailVerify,
    loginUser,
    getUserDetails,
    getAllUsers,
    updateUserDetails,
    deleteUser,
    getUserById,
    forgotPassword,
    resetPassword,
    changePassword,
    logoutUser,
    uploadProfilePicture,
    getProfilePicture,
    updateProfilePicture,
    deleteProfilePicture,
} = require('../controllers/Authorization');
const passport = require('../config/passport-jwt-strategy');
const accessTokenAutoRefresh = require('../middleware/accessTokenAutoRefresh');
const router = express.Router();

router.post('/register', createUser);
router.post('/verifyEmail', emailVerify);
router.post('/login', loginUser);

// Use the accessTokenAutoRefresh middleware to refresh tokens as needed
router.get('/me', accessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), getUserDetails);
router.get('/users', getAllUsers);
router.put('/update/:userId', passport.authenticate('jwt', { session: false }), updateUserDetails);
router.delete('/delete/:userId', passport.authenticate('jwt', { session: false }), deleteUser);
router.get('/:userId', passport.authenticate('jwt', { session: false }), getUserById);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.put('/changePassword/:userId', passport.authenticate('jwt', { session: false }), changePassword);
router.post('/logout', logoutUser);
router.post('/uploadProfilePicture/:userId', passport.authenticate('jwt', { session: false }), uploadProfilePicture);
router.get('/profilePicture/:userId', passport.authenticate('jwt', { session: false }), getProfilePicture);
router.put('/updateProfilePicture/:userId', passport.authenticate('jwt', { session: false }), updateProfilePicture);
router.delete('/deleteProfilePicture/:userId', passport.authenticate('jwt', { session: false }), deleteProfilePicture);

module.exports = router;
