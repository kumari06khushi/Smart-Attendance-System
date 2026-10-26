
const Admin = require ("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const EmailOTP = require("../models/EmailOTP");
const { sendEmail } = require("../services/emailService");

const JWT_SECRET = "!A#tt***&sheet@75%$";

//Registration

async function handleAdminRegister(req,res) {
  console.log("UPDATED REGISTER CONTROLLER RUNNING");
    try {
        const {name, email,password} = req.body;

    if(!name || !email || !password){
      return res.status(400).json({
        error: "please fill all the required details..."
      })
    }

//normalizedEmail

    const normalizedEmail = email.trim().toLowerCase();

const emailOTP = await EmailOTP.findOne({
    email: normalizedEmail,
    verified: true
});

if (!emailOTP || emailOTP.expiresAt.getTime() < Date.now()) {
    return res.status(403).json({
        message: "Please verify your email before registering"
    });
}

    const existingAdmin = await Admin.findOne({ email: normalizedEmail});

      if (existingAdmin) {
            return res.status(409).json({
                error: " This account is already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin =  await Admin.create({name,
             email: normalizedEmail,
              password:hashedPassword});

// ek bar otp s register hone k baad same otp k use nhi kr skte use delete kr dega

              await EmailOTP.deleteOne({ email: normalizedEmail });
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


    
async function handleSendOTP(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        const existingOTP = await EmailOTP.findOne({ email });

        // Allow only one OTP request per 60 seconds
        if (
            existingOTP &&
            Date.now() - existingOTP.lastSentAt.getTime() < 60 * 1000
        ) {
            return res.status(429).json({
                message: "Please wait 60 seconds before requesting another OTP"
            });
        }

        // Generate a cryptographically secure 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Store only the hash of the OTP
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const emailOTPData = {
            otpHash,
            expiresAt,
            attempts: 0,
            lastSentAt: new Date(),
            verified: false
        };

        if (existingOTP) {
            await EmailOTP.updateOne(
                { email },
                { $set: emailOTPData }
            );
        } else {
            await EmailOTP.create({
                email,
                ...emailOTPData
            });
        }

        const sent = await sendEmail(
            email,
            "Attendance Maker - Email Verification OTP",
            `Your OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`
        );

        if (!sent) {
            await EmailOTP.deleteOne({ email });

            return res.status(500).json({
                message: "Unable to send OTP. Please try again later."
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully. Please check your email."
        });

    } catch (error) {
        console.error("Send OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


async function handleVerifyOTP(req, res) {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                message: "OTP must be 6 digits"
            });
        }

        const emailOTP = await EmailOTP.findOne({ email });

        if (!emailOTP) {
            return res.status(400).json({
                message: "Please request an OTP first"
            });
        }

        if (emailOTP.verified) {
            return res.status(200).json({
                message: "Email already verified"
            });
        }

        if (emailOTP.expiresAt.getTime() < Date.now()) {
            await EmailOTP.deleteOne({ email });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        if (emailOTP.attempts >= 5) {
            await EmailOTP.deleteOne({ email });

            return res.status(429).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const submittedHash = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex");

        if (submittedHash !== emailOTP.otpHash) {
            emailOTP.attempts += 1;
            await emailOTP.save();

            return res.status(400).json({
                message: "Incorrect OTP"
            });
        }

        emailOTP.verified = true;
        await emailOTP.save();

        return res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            message: "Internal server error"
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




 module.exports = {handleAdminRegister, handleSendOTP, handleVerifyOTP ,handleAdminLogin,};
    
