const User = require('../models/User');
const Otp = require('../models/OtpVerification');
const emailOtpVerification = require('../utils/emailOtpVerification');
const { jwtAccessToken, generateRefreshToken } = require('../utils/generateToken');
const setTokenCookies = require('../utils/setTokenCookies');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Only keep if used in forgot/reset password
const VerifiedUser = require('../models/VerifiedUser');

// Standardized error response utility
const sendErrorResponse = (res, message, statusCode = 500) => {
    res.status(statusCode).json({ status: 'error', message });
};

// Create user
// Create user
exports.createUser = async (req, res) => {
    const { name, email, phoneNo, password, confirmedPassword } = req.body;

    try {
        // Check if passwords match
        if (password !== confirmedPassword) {
            return sendErrorResponse(res, 'Passwords do not match.', 400);
        }

        const existingVerifiedUser = await VerifiedUser.findOne({ email });
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.isVerified === false) {
                // Delete the unverified user
                await User.deleteOne({ email });
            } 
        }
        if(existingVerifiedUser)
        {
            return sendErrorResponse(res, 'Email is already registered.', 400);
        }
        


        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, phoneNo, password: hashedPassword, isVerified: false });

        // Send OTP for email verification
        await emailOtpVerification(req, user);
        await user.save();

        res.status(201).json({ status: 'success', message: 'Signup successful. Please verify the OTP sent to your email.' });
    } catch (error) {
        console.error('Error creating user:', error.message);
        sendErrorResponse(res, 'An error occurred while creating the user.');
    }
};


// Get user details
exports.getUserDetails = [
    async (req, res) => {
        res.json({ status: 'success', user: req.user });
    }
];

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ status: 'success', users });
    } catch (error) {
        sendErrorResponse(res, error.message);
    }
};

// Email verification
exports.emailVerify = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return sendErrorResponse(res, 'Email and OTP are required.', 400);
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return sendErrorResponse(res, 'User not found.', 404);
        }

        // Verify OTP
        const otpVerification = await Otp.findOne({ userId: user._id, otp });
        if (!otpVerification) {
            return sendErrorResponse(res, 'Invalid or expired OTP.', 400);
        }

        // Create and save verified user
        const verifiedUser = new VerifiedUser({
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo,
            password: user.password, // Consider storing a hashed password
            isVerified: true
        });

        const accessToken = await jwtAccessToken(user);
        const refreshToken = await generateRefreshToken(user);
        setTokenCookies(res, accessToken, refreshToken);
        await verifiedUser.save();
        await User.deleteOne({ _id: user._id }); // Delete the original user
        await Otp.deleteOne({ userId: user._id, otp }); // Remove OTP record

        // Generate tokens

        res.status(200).json({ status: 'success', message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Error verifying email:', error.message);
        sendErrorResponse(res, 'An error occurred during verification. Please try again later.');
    }
};

// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendErrorResponse(res, 'Email and password are required.', 400);
    }

    try {
        const user = await VerifiedUser.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return sendErrorResponse(res, 'Invalid email or password.', 401);
        }

        if (!user.isVerified) {
            return sendErrorResponse(res, 'Email not verified.', 403);
        }

        // Generate tokens
        const accessToken = jwtAccessToken(user);
        const refreshToken = await generateRefreshToken(user);
        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({ status: 'success', message: 'Login successful.' });
    } catch (error) {
        console.error('Error logging in:', error.message);
        sendErrorResponse(res, 'An error occurred during login.');
    }
};

// Update user details
exports.updateUserDetails = async (req, res) => {
    const { userId } = req.params;
    const { name, phoneNo } = req.body;

    try {
        const user = await VerifiedUser.findByIdAndUpdate(userId, { name, phoneNo }, { new: true });
        if (!user) {
            return sendErrorResponse(res, 'User not found.', 404);
        }
        res.status(200).json({ status: 'success', message: 'User details updated successfully.', user });
    } catch (error) {
        console.error('Error updating user details:', error.message);
        sendErrorResponse(res, 'An error occurred while updating user details.');
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await VerifiedUser.findByIdAndDelete(userId);
        if (!user) {
            return sendErrorResponse(res, 'User not found.', 404);
        }
        res.status(200).json({ status: 'success', message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        sendErrorResponse(res, 'An error occurred while deleting the user.');
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await VerifiedUser.findById(userId);
        if (!user) {
            return sendErrorResponse(res, 'User not found.', 404);
        }
        res.status(200).json({ status: 'success', user });
    } catch (error) {
        console.error('Error getting user by ID:', error.message);
        sendErrorResponse(res, 'An error occurred while getting the user.');
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return sendErrorResponse(res, 'Email is required.', 400);
    }

    try {
        const user = await VerifiedUser.findOne({ email });
        if (!user) {
            return sendErrorResponse(res, 'User not found.', 404);
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        // Save the reset token with expiration (implement according to your needs)

        // Send email with reset link
        await sendResetEmail(email, resetToken); // Assume sendResetEmail is defined

        res.status(200).json({ status: 'success', message: 'Reset password email sent.' });
    } catch (error) {
        console.error('Error sending forgot password email:', error.message);
        sendErrorResponse(res, 'An error occurred while processing the request.');
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return sendErrorResponse(res, 'Reset token and new password are required.', 400);
    }

    try {
        // Verify the reset token and get the user (implement according to your needs)

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update user password (implement according to your needs)

        res.status(200).json({ status: 'success', message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        sendErrorResponse(res, 'An error occurred while resetting the password.');
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await VerifiedUser.findById(userId);
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            return sendErrorResponse(res, 'Invalid old password.', 401);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        sendErrorResponse(res, 'An error occurred while changing the password.');
    }
};

// Logout user
exports.logoutUser = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ status: 'success', message: 'Logout successful.' });
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    const { userId } = req.params;

    if (!req.file) {
        return sendErrorResponse(res, 'No file uploaded.', 400);
    }

    try {
        const profilePictureUrl = await uploadProfilePictureToStorage(req.file); // Implement your storage logic
        await VerifiedUser.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl }, { new: true });
        res.status(200).json({ status: 'success', message: 'Profile picture uploaded successfully.', profilePictureUrl });
    } catch (error) {
        console.error('Error uploading profile picture:', error.message);
        sendErrorResponse(res, 'An error occurred while uploading the profile picture.');
    }
};

// Get profile picture
exports.getProfilePicture = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await VerifiedUser.findById(userId);
        if (!user) {
            return sendErrorResponse(res, 'User not found.', 404);
        }

        res.status(200).json({ status: 'success', profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error getting profile picture:', error.message);
        sendErrorResponse(res, 'An error occurred while getting the profile picture.');
    }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
    const { userId } = req.params;

    if (!req.file) {
        return sendErrorResponse(res, 'No file uploaded.', 400);
    }

    try {
        const profilePictureUrl = await uploadProfilePictureToStorage(req.file); // Implement your storage logic
        await VerifiedUser.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl }, { new: true });
        res.status(200).json({ status: 'success', message: 'Profile picture updated successfully.', profilePictureUrl });
    } catch (error) {
        console.error('Error updating profile picture:', error.message);
        sendErrorResponse(res, 'An error occurred while updating the profile picture.');
    }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
    const { userId } = req.params;

    try {
        await VerifiedUser.findByIdAndUpdate(userId, { profilePicture: null }, { new: true });
        res.status(200).json({ status: 'success', message: 'Profile picture deleted successfully.' });
    } catch (error) {
        console.error('Error deleting profile picture:', error.message);
        sendErrorResponse(res, 'An error occurred while deleting the profile picture.');
    }
};
