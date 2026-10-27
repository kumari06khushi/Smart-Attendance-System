
const express = require("express");

const {
  handleAdminRegister,
  handleSendOTP,
  handleVerifyOTP,
  handleAdminLogin,
  handleForgotPasswordSendOTP,
  handleForgotPasswordVerifyOTP,
  handleResetPassword
} = require("../controllers/admin");

const router = express.Router();

// Admin Register and Login
router.post("/register", handleAdminRegister);
router.post("/login", handleAdminLogin);

// Registration Email OTP
router.post("/send-otp", handleSendOTP);
router.post("/verify-otp", handleVerifyOTP);

// Forgot Password OTP
router.post(
  "/forgot-password/send-otp",
  handleForgotPasswordSendOTP
);

router.post(
  "/forgot-password/verify-otp",
  handleForgotPasswordVerifyOTP
);

// Reset Password
router.post("/reset-password", handleResetPassword);

module.exports = router;
