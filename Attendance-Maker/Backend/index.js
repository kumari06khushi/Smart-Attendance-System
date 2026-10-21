const cors = require("cors");
const express = require ("express");
const {connectToMongoDB} = require("./config/db");
const adminRouter = require ("./routes/admin");
const studentRouter = require ("./routes/student")
const  attendanceRouter = require("./routes/attendance");
const subjectRouter = require("./routes/subject");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = 1000;

connectToMongoDB("mongodb://localhost:27017/attendance-sheet").then(() => console.log("Mongodb of Attendance-Maker is connected"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/admin",adminRouter);
app.use("/student",studentRouter);
app.use("/attendancepage",attendanceRouter);
app.use("/subject", subjectRouter);

app.listen(PORT,() => console.log(`Attendance Maker started  at PORT:${PORT}`));