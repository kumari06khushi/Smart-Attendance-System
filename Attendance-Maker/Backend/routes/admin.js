const express = require ("express");
const {handleAdminRegister,handleAdminLogin} = require("../controllers/admin");



const router = express.Router();
router.post("/register",handleAdminRegister);
router.post("/login",handleAdminLogin);

module.exports = router;