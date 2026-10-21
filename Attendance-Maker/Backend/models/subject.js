const mongoose = require ("mongoose");

const subjectSchema = new mongoose.Schema({

 subject:{
type: String,
 required: true, 
 trim: true 
},

subCode: {
type: String,
required: true,
trim: true,
 },

branch:{
type: String,
 required: true,
enum: ["Civil", "Mechanical", "Electrical","Electrical & Communication","Electrical & Electronics","Computer Science"],
},

semester: {
    type: Number,
    required: true
},

});

const Subjects = mongoose.model('Subject', subjectSchema);

module.exports = Subjects;