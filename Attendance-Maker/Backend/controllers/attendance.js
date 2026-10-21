
const Attendance = require("../models/attendance");
const Students = require("../models/student");
const Subjects = require("../models/subject");

// Find subject by code or name for a specific branch and semester
async function findSubject(branch, semester, value) {
  const subjects = await Subjects.find({
    branch,
    semester: Number(semester),
  });

  const searchValue = value.trim().toLowerCase();

  return subjects.find(
    (item) =>
      item.subCode.trim().toLowerCase() === searchValue ||
      item.subject.trim().toLowerCase() === searchValue
  );
}

// Submit Attendance
async function submitAttendance(req, res) {
  try {
    const { date,  year, attendance, branch, semester, subjectCode } = req.body;

    if (
      !date ||
      !year ||
      !Array.isArray(attendance) ||
      attendance.length === 0 ||
      !branch ||
      !semester ||
      !subjectCode?.trim()
    ) {
      return res.status(400).json({
        error:
          "Date, attendance, branch, semester and subject code are required.",
      });
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        error: "Invalid attendance date.",
      });
    }

    // Verify subject code using branch and semester
    const subject = await findSubject(
      branch,
      semester,
      subjectCode
    );

    if (!subject) {
      return res.status(404).json({
        error:
          "Invalid subject code for the selected branch and semester.",
      });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Prevent duplicate attendance for the same date and subject
    const existingAttendance = await Attendance.findOne({
      date: { $gte: startDate, $lt: endDate },
      branch,
      semester: Number(semester),
      subject: subject._id,
    });

    if (existingAttendance) {
      return res.status(400).json({
        error:
          "Attendance for this date and subject is already submitted.",
      });
    }

    const attendanceRecords = [];
    const seenRollNumbers = new Set();

    for (const item of attendance) {
      if (
        !item.rollNumber ||
        ![0, 1].includes(item.status) ||
        seenRollNumbers.has(item.rollNumber)
      ) {
        return res.status(400).json({
          error: "Invalid or duplicate attendance entry.",
        });
      }

      seenRollNumbers.add(item.rollNumber);

      const student = await Students.findOne({
        rollNumber: item.rollNumber,
        branch,
        semester: Number(semester),
        year: Number(year),
      });

      // Older requests may not send year; verify by roll number and branch instead.
      const verifiedStudent =
        student ||
        (await Students.findOne({
          rollNumber: item.rollNumber,
          branch,
          semester: Number(semester),
        }));

      if (!verifiedStudent) {
        return res.status(404).json({
          error: `Student with roll number ${item.rollNumber} not found for the selected filters.`,
        });
      }

      attendanceRecords.push({
        date: attendanceDate,
        student: verifiedStudent._id,
        rollNumber: verifiedStudent.rollNumber,
        branch: verifiedStudent.branch,
        semester: Number(semester),
        subject: subject._id,
        status: item.status,
      });
    }

    const savedAttendance = await Attendance.insertMany(
      attendanceRecords
    );

    return res.status(201).json({
      message: "Attendance submitted successfully.",
      subject: subject.subject,
      subjectCode: subject.subCode,
      attendance: savedAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

// Attendance History
async function getAttendanceHistory(req, res) {
  try {
    const { branch, month, semester, subject, subjectCode } = req.query;
    const subjectValue = subjectCode || subject;

    if (!branch || !month || !semester || !subjectValue) {
      return res.status(400).json({
        error: "Branch, month, semester and subject code are required.",
      });
    }

    const selectedSubject = await findSubject(
      branch,
      semester,
      subjectValue
    );

    if (!selectedSubject) {
      return res.status(404).json({
        error:
          "Subject not found for the selected branch and semester.",
      });
    }

    const startDate = new Date(`${month}-01`);

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        error: "Invalid month. Use YYYY-MM format.",
      });
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const attendance = await Attendance.find({
      branch,
      semester: Number(semester),
      subject: selectedSubject._id,
      date: { $gte: startDate, $lt: endDate },
    });

    const students = await Students.find({
      branch,
      semester: Number(semester),
    });

    const workingDates = new Set(
      attendance.map((item) =>
        item.date.toISOString().split("T")[0]
      )
    );

    const workingDays = workingDates.size;

    const history = students.map((student) => {
      const studentAttendance = attendance.filter(
        (item) =>
          item.student.toString() === student._id.toString()
      );

      const presentDays = studentAttendance.filter(
        (item) => item.status === 1
      ).length;

      const absentDays = studentAttendance.filter(
        (item) => item.status === 0
      ).length;

      return {
        rollNumber: student.rollNumber,
        studentName:
          `${student.firstName} ${student.lastName || ""}`.trim(),
        presentDays,
        absentDays,
        workingDays,
      };
    });

    return res.status(200).json({
      branch,
      month,
      semester: Number(semester),
      subject: selectedSubject.subject,
      subjectCode: selectedSubject.subCode,
      workingDays,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  submitAttendance,
  getAttendanceHistory,
};
