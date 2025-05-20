const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpStore = new Map(); // For now, in-memory store
const fetchuser = require("../middleware/fetchuser");
// const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require("dotenv");

dotenv.config({
  path: "../.env",
});

// Route 1 Get all the details of the user using GET . /api/user/details login is required...

router.get("/details", fetchuser, async (req, res) => {
  // Check if the user is authenticated
  if (!req.userDataReq) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  // Check if the user ID is present in the request

  try {
    // Check if the user ID is present in the request
    const user = await User.findById(req.userDataReq.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route 2 Creating a User using POST . /api/user NO login is required ...
// Register a User

router.post(
  "/",
  [
    // Input validation
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("phone", "Enter a valid phone number").isLength({ min: 10 }),
    body("city", "Enter a valid city").isLength({ min: 3 }),
    body("state", "Enter a valid state").isLength({ min: 3 }),
    body("district", "Enter a valid district").isLength({ min: 3 }),
    body("pincode", "Enter a valid pincode").isLength({ min: 6 }),
    body("address", "Enter a valid address").isLength({ min: 3 }),
    body("password").notEmpty().withMessage("Password cannot be blank"),
  ],
  async (req, res) => {
    // Validate input fields
    // The validationResult function checks for validation errors in the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the user already exists with the given email
      // The findOne method searches for a user with the specified email in the database
      let existingUser = await User.findOne({ email: req.body.email });
      // If a user with the same email already exists, return an error response
      if (existingUser) {
        return res.status(400).json({
          errors: [
            { msg: "Sorry, a user with this email is already registered" },
          ],
        });
      }

      //  Destructuring the request body to extract user details
      // The request body contains the user details sent from the client-side
      // The destructuring assignment allows us to extract the values from the request body
      // and assign them to variables with the same name
      let {
        name,
        email,
        phone,
        city,
        state,
        district,
        pincode,
        address,
        password,
      } = req.body;

      // Generate hashed password with bcrypt
      // The genSalt function generates a salt for hashing the password
      // The salt is a random value that is used to make the hashed password more secure
      const salt = await bcrypt.genSalt(10);
      // The hash function hashes the password using the generated salt
      const securePassword = await bcrypt.hash(password, salt);

      // Create and save new user
      const user = new User({
        name: name,
        email: email,
        phone: phone,
        city: city,
        state: state,
        district: district,
        pincode: pincode,
        address: address,
        password: securePassword,
      });

      await user.save();

      // Create JWT data with user ID
      // The user ID is extracted from the saved user object
      const data = {
        user: {
          id: user.id,
        },
      };

      // console.log(data);
      // console.log(data.user);
      // console.log(data.user.id);

      // Create JWT
      // const JWT_TOKEN = jwt.sign(data, process.env.JWT_SECRET_SIGH, { expiresIn: "1h" });
      const JWT_TOKEN = jwt.sign(data, process.env.JWT_SECRET);

      res.json({ token: JWT_TOKEN });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 3 Login in a User using POST . /api/user/login NO login is required...

router.post(
  "/login",
  [
    // Input validation
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").notEmpty(),
  ],
  async (req, res) => {
    // Validate input fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Destructure the request body to extract email and password
    const { email, password } = req.body;

    try {
      // Check if the user exists with the given email
      const user = await User.findOne({ email });
      if (!user) {
        // If the user does not exist, return an error response
        return res.status(400).json({
          errors: { msg: "Invalid email or password" },
        });
      }

      // Compare the entered password with the hashed password in the database
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      // If the password does not match, return an error response
      // The compare function checks if the entered password matches the hashed password
      if (!isPasswordMatch) {
        return res.status(400).json({
          errors: [{ msg: "Invalid email or password" }],
        });
      }

      // Create JWT data with user ID
      const data = {
        // The user ID is extracted from the found user object
        // The user ID is used to identify the user in the JWT token
        user: {
          id: user.id,
        },
      };

      // Generate JWT token
      // const JWT_TOKEN = jwt.sign(data, process.env.JWT_SECRET_SIGH, { expiresIn: "1h" });
      const JWT_TOKEN = jwt.sign(data, process.env.JWT_SECRET);

      // Respond with token
      res.json({ token: JWT_TOKEN });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//  Route 4 Update the Details of the user using PUT . /api/user/:id login is required...
// Update the user details
// The user ID is passed as a URL parameter in the request
// The user ID is used to identify which user to update in the database
router.put("/:id", fetchuser, async (req, res) => {
  // Check if the user is authenticated
  if (!req.userDataReq) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  if (!req.params.id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Check if the user ID is present in the request
    let user = await User.findById(req.params.id);
    if (!user) {
      // If the user ID is not found, return an error response
      // The findById method searches for a user with the specified ID in the database
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      phone,
      city,
      state,
      district,
      pincode,
      address,
      password,
      image, //  Add image here
    } = req.body;

    let updateFields = {
      name,
      email,
      phone,
      city,
      state,
      district,
      pincode,
      address,
      password,
    };

    if (image) {
      updateFields.image = image; //  Add image only if it's provided
    }

    // Find the user by ID and update the user details
    // The findByIdAndUpdate method searches for a user with the specified ID in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    // Send the updated user details in the response
    // The new option is set to true to return the updated user object
    res.status(200).json({
      message: `Updated successfully with id ${req.params.id}`,
      updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

const logActivity = (activity, details) => {
  console.log(`[${new Date().toISOString()}] ${activity}: ${JSON.stringify(details)}`);
};

// Configure nodemailer transporter
const configureTransporter = () => {
  // Check if credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials are missing. Check your environment variables.");
  }
  
  // For development/testing, allow console logging instead of actual email sending
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_EMAIL === 'true') {
    return {
      sendMail: (mailOptions, callback) => {
        console.log('================ MOCK EMAIL ================');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('OTP:', mailOptions.html.match(/\d{6}/)[0]);
        console.log('===========================================');
        callback(null, { response: 'Mock email sent successfully' });
      }
    };
  }
  
  // Create proper transporter with detailed configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Helps with self-signed certificates in some environments
    }
  });
};

// POST /api/user/forgot-password
// router.post(
//   '/forgot-password',
//   [
//     body('email').isEmail().withMessage('Please provide a valid email')
//   ],
//   async (req, res) => {
//     // Validate request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ message: errors.array()[0].msg });
//     }

//     try {
//       const { email } = req.body;
      
//       // Find user by email
//       const user = await User.findOne({ email });
//       if (!user) {
//         logActivity('Forgot Password Attempt', { email, status: 'User not found' });
//         // For security reasons, don't disclose that user doesn't exist
//         // return res.status(200).json({ message: 'If your email is registered, you will receive an OTP shortly' });
//         return res.status(200).json({ message: 'Please enter a valid email ID' });
//       }

//       // Generate a 6-digit OTP
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Store OTP with expiration (10 minutes)
//       const expires = Date.now() + 10 * 60 * 1000;
//       otpStore.set(email, { otp, expires });
      
//       try {
//         // Configure transporter
//         const transporter = configureTransporter();
  
//         // Prepare email content with more professional formatting
//         const mailOptions = {
//           from: `"BrainsKart Support" <${process.env.EMAIL_USER || 'noreply@brainskart.com'}>`,
//           to: email,
//           subject: 'BrainsKart Password Reset OTP',
//           html: `
//             <!DOCTYPE html>
//             <html>
//             <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title>Password Reset</title>
//               <style>
//                 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                 .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
//                 .header { background-color: #4a86e8; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px; }
//                 .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777; margin: 20px -20px -20px; border-radius: 0 0 10px 10px; }
//                 .otp-container { background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; font-size: 28px; letter-spacing: 5px; margin: 20px 0; border: 1px dashed #ccc; }
//                 .button { display: inline-block; background-color: #4a86e8; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }
//               </style>
//             </head>
//             <body>
//               <div class="container">
//                 <div class="header">
//                   <h2>Password Reset Request</h2>
//                 </div>
                
//                 <p>Hello,</p>
//                 <p>We received a request to reset your BrainsKart account password. Please use the following One-Time Password (OTP) to complete your password reset:</p>
                
//                 <div class="otp-container">
//                   <strong>${otp}</strong>
//                 </div>
                
//                 <p><strong>This OTP will expire in 10 minutes.</strong></p>
//                 <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
                
//                 <p>Best regards,<br>BrainsKart Team</p>
                
//                 <div class="footer">
//                   <p>This is an automated message, please do not reply to this email.</p>
//                   <p>&copy; ${new Date().getFullYear()} BrainsKart. All rights reserved.</p>
//                 </div>
//               </div>
//             </body>
//             </html>
//           `
//         };
  
//         // Send email with proper promise handling
//         transporter.sendMail(mailOptions)
//           .then(info => {
//             logActivity('OTP Sent', { email, status: 'Success', messageId: info.messageId });
//             return res.status(200).json({ message: 'OTP sent successfully' });
//           })
//           .catch(error => {
//             logActivity('Email Send Error', { email, error: error.message });
            
//             // For development purposes only - return the OTP in the response
//             if (process.env.NODE_ENV === 'development') {
//               return res.status(200).json({ 
//                 message: 'Email sending failed, but for development purposes, here is your OTP',
//                 devOtp: otp
//               });
//             }
            
//             return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
//           });
//       } catch (emailError) {
//         logActivity('Email Configuration Error', { error: emailError.message });
        
//         // For development purposes only - return the OTP in the response
//         if (process.env.NODE_ENV === 'development') {
//           return res.status(200).json({ 
//             message: 'Email service is not configured. For development purposes, here is your OTP',
//             devOtp: otp
//           });
//         }
        
//         return res.status(500).json({ message: 'Email service configuration error. Please contact support.' });
//       }
//     } catch (error) {
//       logActivity('Server Error', { route: '/forgot-password', error: error.message });
//       return res.status(500).json({ message: 'Server error. Please try again later.' });
//     }
//   }
// );



// POST /api/user/forgot-password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        logActivity('Forgot Password Attempt', { email, status: 'User not found' });
        // Return a 404 status code with an error message for non-existent email
        return res.status(404).json({ message: 'No account found with this email address' });
      }
      
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (10 minutes)
      const expires = Date.now() + 10 * 60 * 1000;
      otpStore.set(email, { otp, expires });
      
      try {
        // Configure transporter
        const transporter = configureTransporter();
  
        // Prepare email content with more professional formatting
        const mailOptions = {
          from: `"BrainsKart Support" <${process.env.EMAIL_USER || 'noreply@brainskart.com'}>`,
          to: email,
          subject: 'BrainsKart Password Reset OTP',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
                .header { background-color: #4a86e8; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px; }
                .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777; margin: 20px -20px -20px; border-radius: 0 0 10px 10px; }
                .otp-container { background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; font-size: 28px; letter-spacing: 5px; margin: 20px 0; border: 1px dashed #ccc; }
                .button { display: inline-block; background-color: #4a86e8; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Password Reset Request</h2>
                </div>
                
                <p>Hello,</p>
                <p>We received a request to reset your BrainsKart account password. Please use the following One-Time Password (OTP) to complete your password reset:</p>
                
                <div class="otp-container">
                  <strong>${otp}</strong>
                </div>
                
                <p><strong>This OTP will expire in 10 minutes.</strong></p>
                <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
                
                <p>Best regards,<br>BrainsKart Team</p>
                
                <div class="footer">
                  <p>This is an automated message, please do not reply to this email.</p>
                  <p>&copy; ${new Date().getFullYear()} BrainsKart. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        };
  
        // Send email with proper promise handling
        transporter.sendMail(mailOptions)
          .then(info => {
            logActivity('OTP Sent', { email, status: 'Success', messageId: info.messageId });
            return res.status(200).json({ message: 'OTP sent successfully' });
          })
          .catch(error => {
            logActivity('Email Send Error', { email, error: error.message });
            
            // For development purposes only - return the OTP in the response
            if (process.env.NODE_ENV === 'development') {
              return res.status(200).json({ 
                message: 'Email sending failed, but for development purposes, here is your OTP',
                devOtp: otp
              });
            }
            
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
          });
      } catch (emailError) {
        logActivity('Email Configuration Error', { error: emailError.message });
        
        // For development purposes only - return the OTP in the response
        if (process.env.NODE_ENV === 'development') {
          return res.status(200).json({ 
            message: 'Email service is not configured. For development purposes, here is your OTP',
            devOtp: otp
          });
        }
        
        return res.status(500).json({ message: 'Email service configuration error. Please contact support.' });
      }
    } catch (error) {
      logActivity('Server Error', { route: '/forgot-password', error: error.message });
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
);


// POST /api/user/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, otp } = req.body;
      
      // Get stored OTP
      const record = otpStore.get(email);
      
      // Validate OTP
      if (!record) {
        logActivity('OTP Verification', { email, status: 'No OTP record found' });
        return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
      }
      
      if (record.otp !== otp) {
        logActivity('OTP Verification', { email, status: 'Invalid OTP' });
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      }
      
      if (Date.now() > record.expires) {
        logActivity('OTP Verification', { email, status: 'Expired OTP' });
        // Remove expired OTP
        otpStore.delete(email);
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      }

      logActivity('OTP Verification', { email, status: 'Success' });
      return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
      logActivity('Server Error', { route: '/verify-otp', error: error.message });
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
);

// POST /api/user/reset-password
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, otp, newPassword } = req.body;
      
      // Get stored OTP
      const record = otpStore.get(email);
      
      // Validate OTP
      if (!record || record.otp !== otp || Date.now() > record.expires) {
        logActivity('Password Reset', { email, status: 'Invalid or expired OTP' });
        return res.status(400).json({ message: 'Invalid or expired OTP. Please verify OTP again.' });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        logActivity('Password Reset', { email, status: 'User not found' });
        return res.status(404).json({ message: 'User not found' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update user password
      await User.updateOne({ email }, { $set: { password: hashedPassword } });
      
      // Clear OTP after successful password reset
      otpStore.delete(email);
      
      logActivity('Password Reset', { email, status: 'Success' });
      return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      logActivity('Server Error', { route: '/reset-password', error: error.message });
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
);


module.exports = router;
