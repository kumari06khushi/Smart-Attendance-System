const Admin = require ("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "!A#tt***&sheet@75%$";

async function handleAdminRegister(req,res) {

    try {
        const {name, email,password} = req.body;

    if(!name || !email || !password){
      return res.status(400).json({
        error: "please fill all the required details..."
      })
    }

    const existingAdmin = await Admin.findOne({email});

      if (existingAdmin) {
            return res.status(409).json({
                error: " This account is already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin =  await Admin.create({name, email, password:hashedPassword});
         newAdmin.password = undefined;

         return res.status(201).json({
                message: "Registration succesfull.",newAdmin
            }); 
    } 

    catch (err) {
         return res.status(500).json({
            error: err.message,
        }); 
    }

    }


    async function handleAdminLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find admin by email
        const existingAdmin = await Admin.findOne({ email });

        if (!existingAdmin) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingAdmin.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
    {
        id: existingAdmin._id,
        email: existingAdmin.email
    },
    JWT_SECRET,
    {
        expiresIn: "1d"
    }
   );

        // 4. Login successful
        return res.status(200).json({
            message: " Login successful",
             token: token
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

     module.exports = {handleAdminRegister,handleAdminLogin };
    
