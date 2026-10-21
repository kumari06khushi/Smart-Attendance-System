const Students = require("../models/student");


async function createNewStudent(req,res) {
    try{
    const {firstName, lastName,fatherName, phone, branch, gender, year, semester, } =  req.body;  // destructering

    if(!firstName || !fatherName || !phone || !branch || ! gender  || !year ||!semester ){
          return res.status(400).json({
                error: "All the details  of Student must be Fill..."
            });
    }
   const existingStudent = await Students.findOne({phone});

        if (existingStudent) {
            return res.status(400).json({
                error: "Student is already exist."
            });
        }

        // Branch Code
        const branchCodes = {
            "Civil": "CE",
            "Mechanical": "ME",
            "Electrical": "EE",
            "Electrical & Communication": "EC",
            "Electrical & Electronics": "EEE",
            "Computer Science": "CS"
        };

        const branchCode = branchCodes[branch];

        if (!branchCode) {
            return res.status(400).json({
                error: "Invalid branch."
            });
        }

        // Year Code
        const yearCode = String(year).slice(-2);

        // Find last student of same year + branch
        const lastStudent = await Students.findOne({
            year: year,
            branch: branch
        }).sort({ rollNumber: -1 });

        let serialNumber = 1;

        if (lastStudent) {
            const lastSerial = parseInt(lastStudent.rollNumber.slice(-3));
            serialNumber = lastSerial + 1;
        }

        // 001, 002, 003...
        const serial = String(serialNumber).padStart(3, "0");

        // Final Roll Number
        const rollNumber = `${yearCode}${branchCode}${serial}`;

         const newStudent = await Students.create({
          
            firstName: firstName,         
             lastName: lastName,
             fatherName: fatherName,
             phone: phone,
             branch:  branch,
             gender: gender,
             rollNumber: rollNumber,
           year: Number(year),
          
          semester: Number(semester)

              
        });

          console.log("New Student", newStudent);

         return res.status(201).json({
            message: "Student  added successfully",
            newStudent,
        });

    }
      catch (err) {
        return res.status(500).json({
            error: err.message,
        });
    }
}
// get 

async function getAllStudent(req, res) {
    try {

        const { year, branch , semester} = req.query;

        // Check year and branch
        if (!year || !branch || !semester)  {
            return res.status(400).json({
                error: "Year  branch  and semester are required."
            });
        }

        const allStudent = await Students.find({
            year: Number(year),
            semester:  Number( semester),
            branch: branch
        });

        if (allStudent.length === 0) {
            return res.status(404).json({
                error: "No Student found for this year and branch."
            });
        }

        return res.status(200).json(allStudent);

    }
    catch (err) {
        return res.status(500).json({
            error: err.message,
        });
    }
}

//  UPDATE *////

async function updateStudent(req,res) {
    try  {
     const rollNumber =  req.params.rollNumber;

     const myStudent = await Students.findOne({rollNumber});

        if(!myStudent){
             return res.status(404).json({
                error: "This Roll Number  does not exist."
            });
    
        }
       
        const {firstName, lastName, fatherName, phone, } = req.body;

         if ( firstName !== undefined) {
          myStudent.firstName = firstName ;
        }

       if ( lastName !== undefined) {
           myStudent.lastName = lastName ;
        }

        if ( fatherName !== undefined) {
           myStudent.fatherName = fatherName ;
        }

        if (phone !== undefined) {
            myStudent .phone = phone;
        }

        await  myStudent.save();

        return res.json({
            message: "Student updated  successfully",
             myStudent,
        });

    }
    catch (err) {
        return res.status(500).json({
            error: err.message,
        });
    }

}

//**** DELETE* *///
async function deleteStudent(req,res) {

    try  {
     const rollNumber =  req.params.rollNumber;

     const myStudent = await Students.findOne({rollNumber});

       if(!myStudent){
             return res.status(404).json({
                error: "This Roll Number  does not exist."
            });
      
        }
          await myStudent.deleteOne();
        
     return res.json({
            message: "Student deleted successfully",
            myStudent, 
        });

    }
      catch (err) {
        return res.status(500).json({
            error: err.message,
        });
    }

}

   module.exports = {createNewStudent, getAllStudent, updateStudent, deleteStudent};