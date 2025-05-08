const jwt = require("jsonwebtoken");
require("dotenv").config();

const fetchuser = (req, res, next) => {
  // Getting a JWT token from the header
  const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Access denied. No token provided." });
    }

    try {
        // Verifying the token using JWT secret key
        // The secret key is stored in the environment variable JWT_SECRET
        const data = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(data)
        // console.log(data.user)
        // console.log(data.user.id)
        // Adding the user data to the request object
        // The user data is extracted from the token and added to the request object
        // This allows us to access the user data in the next middleware or route handler
        req.userDataReq = data.user;
        // console.log(req.userDataReq)
        next();
    } catch (error) {
        return res.status(401).send({ error: "Invalid token" });
    }
};


module.exports = fetchuser;
