const express = require("express");

const { submitAttendance, getAttendanceHistory } = require("../controllers/attendance");
const authenticateAdmin = require("../middleware/authAdmin");

const router = express.Router();

router.post("/submit", authenticateAdmin,submitAttendance);
router.get("/history",authenticateAdmin,getAttendanceHistory);

module.exports = router;