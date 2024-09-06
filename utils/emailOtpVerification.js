const { transporter } = require('../config/email'); // Ensure correct import
const Otp = require('../models/OtpVerification');

const emailOtpVerification = async (req, user) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

        // Set OTP expiry time (15 minutes)
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        // Save the OTP in the database with an expiration time
        await new Otp({
            userId: user._id,
            email: user.email,
            otp: otp,
            expiry: otpExpiry, // Store the expiration time
        }).save();

        const otpVerificationLink = `${process.env.FRONTEND_HOST}/account/verification?otp=${otp}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Your Account Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333;">Verify Your Account</h2>
                    <p>Hello ${user.name},</p>
                    <p>Thank you for registering with us. To complete your registration, please verify your account using the OTP below:</p>
                    <h3 style="color: #0056b3;">${otp}</h3>
                    <p>You can also verify your account by clicking the link below:</p>
                    <a href="${otpVerificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Account</a>
                    <p style="margin-top: 20px;">This OTP is valid for 15 minutes.</p>
                    <p>If you did not request this verification, please ignore this email.</p>
                    <p>Best regards,<br>DJ Tours & Travels</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions); // Send the email
        console.log(`OTP sent to ${user.email}`); // Log only the email address
        return otp; // Return the OTP so it can be saved or verified later
    } catch (error) {
        console.error(`Error sending OTP to ${user.email}: ${error.message}`);
        throw new Error('Error sending OTP');
    }
};

module.exports = emailOtpVerification; // Use module.exports since you're using CommonJS
