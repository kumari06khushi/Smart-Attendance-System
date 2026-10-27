
const mongoose = require("mongoose");

const emailOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    purpose: {
    type: String,
     enum: ["register", "reset"],
      required: true
      },

    otpHash: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    attempts: {
        type: Number,
        default: 0
    },

    lastSentAt: {
        type: Date,
        default: Date.now
    },

    verified: {
        type: Boolean,
        default: false
    }
});

const EmailOTP = mongoose.model("EmailOTP", emailOTPSchema);

module.exports = EmailOTP;
