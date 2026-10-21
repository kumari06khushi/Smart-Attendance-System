
const express = require("express");

const {
  createSubject,
  getSubjects,
  deleteSubject,
} = require("../controllers/subject");

const authenticateAdmin = require("../middleware/authAdmin");

const router = express.Router();

// Add Subject
router.post("/newsubject", authenticateAdmin, createSubject);

// Get All Subjects (optional branch and semester filters)
router.get("/allsubject", authenticateAdmin, getSubjects);

// Delete Subject by MongoDB ID
router.delete("/:id", authenticateAdmin, deleteSubject);

module.exports = router;
