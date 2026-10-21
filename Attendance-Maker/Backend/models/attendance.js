const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    date: {
        type: Date,
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    rollNumber: {
        type: String,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    status: {
        type: Number,
        required: true,
        enum: [0, 1]
    },

subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
},

semester: {
    type: Number,
    required: true
}



});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;





// Notes
//ref mein Mongoose model ka naam aata hai, variable ka naam nahi.