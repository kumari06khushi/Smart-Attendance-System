const express = require ("express");
const {handleAdminRegister,handleSendOTP,handleVerifyOTP, handleAdminLogin } = require("../controllers/admin");

const router = express.Router();

router.post("/register",handleAdminRegister);
router.post("/login",handleAdminLogin);

// Send OTP to email
router.post("/send-otp", handleSendOTP);
router.post("/verify-otp", handleVerifyOTP);


module.exports = router;