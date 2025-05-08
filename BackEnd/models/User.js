const mongoose = require("mongoose");
const { Schema } = mongoose;

// Creating a new Schema object with the required fields
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  Date: {
    type: Date,
    default: Date.now,
  },
});

// Exporting a Schema object and creacting a model instance from the schema object .
// mongoose.model(name of the database collection ,  name of schema object )

module.exports = mongoose.model("user", UserSchema);
