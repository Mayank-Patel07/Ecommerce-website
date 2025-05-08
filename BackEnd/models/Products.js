const mongoose = require("mongoose");
const { Schema } = mongoose;

// Creating a new Schema object with the required fields
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
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

module.exports = mongoose.model("product", ProductSchema);
