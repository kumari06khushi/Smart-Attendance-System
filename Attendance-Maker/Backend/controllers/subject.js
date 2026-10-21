
const Subjects = require("../models/subject");

// Add Subject
async function createSubject(req, res) {
  try {
    const { subject, subCode, branch, semester } = req.body;

    if (
      !subject?.trim() ||
      !subCode?.trim() ||
      !branch ||
      semester === undefined ||
      semester === null ||
      semester === ""
    ) {
      return res.status(400).json({
        error: "Subject, subject code, branch and semester are required.",
      });
    }

    const semesterNumber = Number(semester);

    if (
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        error: "Semester must be a number between 1 and 8.",
      });
    }

    const existingSubject = await Subjects.findOne({
      $or: [
        {
          subject: {
            $regex: `^${subject.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
          branch,
          semester: semesterNumber,
        },
        {
          subCode: {
            $regex: `^${subCode.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
          branch,
          semester: semesterNumber,
        },
      ],
    });

    if (existingSubject) {
      return res.status(400).json({
        error: "This subject name or subject code already exists for this branch and semester.",
      });
    }

    const newSubject = await Subjects.create({
      subject: subject.trim(),
      subCode: subCode.trim(),
      branch,
      semester: semesterNumber,
    });

    return res.status(201).json({
      message: "Subject added successfully.",
      newSubject,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

// Get All Subjects, with optional branch and semester filters
async function getSubjects(req, res) {
  try {
    const { branch, semester } = req.query;
    const filter = {};

    if (branch) {
      filter.branch = branch;
    }

    if (semester !== undefined && semester !== "") {
      const semesterNumber = Number(semester);

      if (
        !Number.isInteger(semesterNumber) ||
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {
        return res.status(400).json({
          error: "Semester must be a number between 1 and 8.",
        });
      }

      filter.semester = semesterNumber;
    }

    const subjects = await Subjects.find(filter).sort({
      branch: 1,
      semester: 1,
      subject: 1,
    });

    return res.status(200).json(subjects);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}


 // Delete Subject
async function deleteSubject(req, res) {
  try {
    const { id } = req.params;

    const deletedSubject = await Subjects.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({
        error: "Subject not found.",
      });
    }

    return res.status(200).json({
      message: "Subject deleted successfully.",
      deletedSubject,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid subject ID.",
      });
    }

    return res.status(500).json({
      error: error.message,
    });
  }
}


module.exports = {
  createSubject,
  getSubjects,
deleteSubject,
};
