const jwt = require("jsonwebtoken");
require("dotenv").config();

const fetchuser = (req, res, next) => {
  // Getting a user from the token and adding it to the request object
    // The token is passed in the request header with the key 'auth-token'
    // The token is used to authenticate the user and authorize access to protected routes
    // The token is generated when the user logs in and is sent back to the client
    // The client stores the token and sends it back to the server with each request
    // The server verifies the token and extracts the user data from it
    // This allows us to identify the user making the request and authorize access to protected resources
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
        // req. is a request object that contains information about the HTTP request
        // userDataReq is a custom property added to the request object
        req.userDataReq = data.user;
        // console.log(req.userDataReq)
        next();
    } catch (error) {
        return res.status(401).send({ error: "Invalid token" });
    }
};


module.exports = fetchuser;
