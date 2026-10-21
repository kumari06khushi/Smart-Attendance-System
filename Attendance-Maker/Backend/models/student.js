const mongoose = require ("mongoose");

const studentSchema = new mongoose.Schema({

 firstName:{
 type: String,
 required: true, 
 trim: true  
},

 lastName:{
 type: String,
 trim: true  
},

 fatherName:{
 type: String,
 required: true, 
 trim: true  
},

phone: {
type: String,
required: true,
unique: true,
match: /^\d{10}$/,
},

branch:{
    type: String,
 required: true,
enum: ["Civil", "Mechanical", "Electrical","Electrical & Communication","Electrical & Electronics","Computer Science"],
},

gender:{
type: String,
 required: true,
enum: ["Male", "Female", "Other"],
 },

rollNumber: {
type: String,
required: true,
 unique: true,
 },

 year: {
    type: Number,
    required: true
},

semester: {
    type: Number,
    required: true
}


});

const Students = mongoose.model('Student', studentSchema);

module.exports = Students;