const express = require ("express");
const {createNewStudent, getAllStudent, updateStudent, deleteStudent} = require("../controllers/student");

const authenticateAdmin = require("../middleware/authAdmin");

const router = express.Router();
router.post("/newstudent",authenticateAdmin,createNewStudent);
router.get("/allstudent", authenticateAdmin, getAllStudent);

router.patch("/:rollNumber",authenticateAdmin, updateStudent);

router.delete("/:rollNumber", authenticateAdmin,deleteStudent );



module.exports = router;