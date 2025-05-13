const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

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

module.exports = router;
