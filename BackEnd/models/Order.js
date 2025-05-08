// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      image: String, // base64 image of product
    },
  ],
  paymentMethod: String,
  totalAmount: Number,
  address: String,
  status: {
    type: String,
    default: "Placed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
