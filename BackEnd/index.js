const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Setup env variables
dotenv.config({
  path: "./.env",
});

// Configure CORS to allow requests from the frontend or different origin 
app.use(cors());

// Middleware to parse JSON requests
// It is recommended to get a data from a request body.
// It is a good practice to use express.json() middleware to parse incoming JSON requests and make the data available in req.body.
// This middleware is used to parse incoming requests with JSON payloads. It is based on body-parser.
app.use(express.json());

// Environment variables
const DB_URL = process.env.MongoDB_URL
const Port = process.env.Port
const Hostname = process.env.Hostname

// Default Route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(DB_URL, {
      // useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
connectDB();

// Importing routes
app.use("/api/user", require("./routes/user"));
app.use("/api/product", require("./routes/product"));
app.use("/api/order", require("./routes/order"));


app.listen(Port,Hostname, () => {
//   console.log(`Example app listening on port ${port}`)
  console.log(`Example app listening on port http://${Hostname}:${Port}`)
})