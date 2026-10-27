
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailOTP = require("../models/EmailOTP");
const { sendEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET;

// ==================== REGISTRATION ====================

async function handleAdminRegister(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required details"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingAdmin = await Admin.findOne({
            email: normalizedEmail
        });

        if (existingAdmin) {
            return res.status(409).json({
                message: "This account already exists"
            });
        }

        const emailOTP = await EmailOTP.findOne({
            email: normalizedEmail,
            purpose: "register",
            verified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!emailOTP) {
            return res.status(403).json({
                message: "Please verify your email before registering"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        await EmailOTP.deleteOne({
            _id: emailOTP._id,
            purpose: "register"
        });

        newAdmin.password = undefined;

        return res.status(201).json({
            message: "Registration successful",
            newAdmin
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== REGISTRATION: SEND OTP ====================

async function handleSendOTP(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        const existingOTP = await EmailOTP.findOne({
            email,
            purpose: "register"
        });

        if (
            existingOTP &&
            Date.now() - existingOTP.lastSentAt.getTime() < 60 * 1000
        ) {
            return res.status(429).json({
                message: "Please wait 60 seconds before requesting another OTP"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const emailOTPData = {
            purpose: "register",
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0,
            lastSentAt: new Date(),
            verified: false
        };

        if (existingOTP) {
            await EmailOTP.updateOne(
                { _id: existingOTP._id, purpose: "register" },
                { $set: emailOTPData }
            );
        } else {
            await EmailOTP.create({
                email,
                ...emailOTPData
            });
        }

        const sent = await sendEmail(
            email,
            "Attendance Maker - Email Verification OTP",
            `Your OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`
        );

        if (!sent) {
            await EmailOTP.deleteOne({
                email,
                purpose: "register"
            });

            return res.status(500).json({
                message: "Unable to send OTP. Please try again later."
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully. Please check your email."
        });

    } catch (error) {
        console.error("Registration send OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== REGISTRATION: VERIFY OTP ====================

async function handleVerifyOTP(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                message: "OTP must be 6 digits"
            });
        }

        const emailOTP = await EmailOTP.findOne({
            email,
            purpose: "register"
        });

        if (!emailOTP) {
            return res.status(400).json({
                message: "Please request a registration OTP first"
            });
        }

        if (emailOTP.verified) {
            if (emailOTP.expiresAt.getTime() > Date.now()) {
                return res.status(200).json({
                    message: "Email already verified"
                });
            }

            await EmailOTP.deleteOne({ _id: emailOTP._id });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        if (emailOTP.expiresAt.getTime() <= Date.now()) {
            await EmailOTP.deleteOne({ _id: emailOTP._id });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        if (emailOTP.attempts >= 5) {
            await EmailOTP.deleteOne({ _id: emailOTP._id });

            return res.status(429).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const submittedHash = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex");

        if (submittedHash !== emailOTP.otpHash) {
            emailOTP.attempts += 1;

            if (emailOTP.attempts >= 5) {
                await EmailOTP.deleteOne({ _id: emailOTP._id });

                return res.status(429).json({
                    message: "Too many incorrect attempts. Please request a new OTP."
                });
            }

            await emailOTP.save();

            return res.status(400).json({
                message: "Incorrect OTP"
            });
        }

        emailOTP.verified = true;
        await emailOTP.save();

        return res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Registration verify OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== LOGIN ====================

async function handleAdminLogin(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (!existingAdmin) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingAdmin.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables");

            return res.status(500).json({
                message: "Server configuration error"
            });
        }

        const token = jwt.sign(
            {
                id: existingAdmin._id,
                email: existingAdmin.email
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== FORGOT PASSWORD: SEND OTP ====================

async function handleForgotPasswordSendOTP(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        const existingOTP = await EmailOTP.findOne({
            email,
            purpose: "reset"
        });

        if (
            existingOTP &&
            Date.now() - existingOTP.lastSentAt.getTime() < 60 * 1000
        ) {
            return res.status(429).json({
                message: "Please wait 60 seconds before requesting another OTP"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const otpData = {
            purpose: "reset",
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0,
            lastSentAt: new Date(),
            verified: false
        };

        if (existingOTP) {
            await EmailOTP.updateOne(
                { _id: existingOTP._id, purpose: "reset" },
                { $set: otpData }
            );
        } else {
            await EmailOTP.create({
                email,
                ...otpData
            });
        }

        const sent = await sendEmail(
            email,
            "Attendance Maker - Password Reset OTP",
            `Your password reset OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`
        );

        if (!sent) {
            await EmailOTP.deleteOne({
                email,
                purpose: "reset"
            });

            return res.status(500).json({
                message: "Unable to send OTP. Please try again later."
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully. Please check your email."
        });

    } catch (error) {
        console.error("Forgot password send OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== FORGOT PASSWORD: VERIFY OTP ====================

async function handleForgotPasswordVerifyOTP(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                message: "OTP must be 6 digits"
            });
        }

        const emailOTP = await EmailOTP.findOne({
            email,
            purpose: "reset",
            verified: false
        });

        if (!emailOTP) {
            return res.status(400).json({
                message: "Please request a password reset OTP first"
            });
        }

        if (emailOTP.expiresAt.getTime() <= Date.now()) {
            await EmailOTP.deleteOne({ _id: emailOTP._id });

            return res.status(400).json({
                message: "OTP expired. Please request a new one."
            });
        }

        if (emailOTP.attempts >= 5) {
            await EmailOTP.deleteOne({ _id: emailOTP._id });

            return res.status(429).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const submittedHash = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex");

        if (submittedHash !== emailOTP.otpHash) {
            emailOTP.attempts += 1;

            if (emailOTP.attempts >= 5) {
                await EmailOTP.deleteOne({ _id: emailOTP._id });

                return res.status(429).json({
                    message: "Too many incorrect attempts. Please request a new OTP."
                });
            }

            await emailOTP.save();

            return res.status(400).json({
                message: "Incorrect OTP"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        emailOTP.verified = true;
        emailOTP.otpHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        emailOTP.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await emailOTP.save();

        return res.status(200).json({
            message: "OTP verified successfully",
            resetToken
        });

    } catch (error) {
        console.error("Forgot password verify OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== FORGOT PASSWORD: RESET PASSWORD ====================

async function handleResetPassword(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                message: "Email, reset token and new password are required"
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const emailOTP = await EmailOTP.findOne({
            email,
            purpose: "reset",
            otpHash: tokenHash,
            verified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!emailOTP) {
            return res.status(400).json({
                message: "Invalid or expired reset session. Please verify OTP again."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await Admin.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        await EmailOTP.deleteOne({
            _id: emailOTP._id,
            purpose: "reset"
        });

        return res.status(200).json({
            message: "Password reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// ==================== EXPORTS ====================

module.exports = {
    handleAdminRegister,
    handleSendOTP,
    handleVerifyOTP,
    handleAdminLogin,
    handleForgotPasswordSendOTP,
    handleForgotPasswordVerifyOTP,
    handleResetPassword
};
