const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const dotenv = require("dotenv");

// Setup env variables
dotenv.config({
  path: "../.env",
});

// POST /api/order - place a new order
// This endpoint is used to place a new order. It requires the user to be authenticated (using fetchuser middleware) and expects the following fields in the request body: cartItems, paymentMethod, totalAmount, and address.
// The cartItems field should contain an array of items, each with a name, price, quantity, and image (base64 encoded).
router.post("/", fetchuser, async (req, res) => {
  try {
    const {
      cartItems,
      paymentMethod,
      totalAmount,
      address,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // If payment method is Razorpay, verify the signature
    if (paymentMethod === "Card") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res
          .status(400)
          .json({ success: false, error: "Missing Razorpay payment details" });
      }

      // Verify the Razorpay signature
      // The signature is generated using the HMAC SHA256 algorithm with the secret key and the order ID and payment ID
      // Generate expected signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.Test_Key_Secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid payment signature" });
      }
    }

    // Validate the request body
    // The validationResult function checks for validation errors in the request body
    // Create a new order (common for both COD and Razorpay)
    const newOrder = new Order({
      user: req.userDataReq.id,
      items: cartItems,
      paymentMethod,
      totalAmount,
      address,
      status: "Placed",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    await newOrder.save();

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Order placement failed:", err);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
});
router.get("/history", fetchuser, async (req, res) => {
  try {
    // Fetch the order history for the logged-in user
    // The user ID is obtained from the JWT token using the fetchuser middleware.
    const userId = req.userDataReq.id; // comes from JWT
    // Find all orders for the user (The field that are created by us during POST request) and sort them by creation date in descending order
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    // Send the order history back to the client
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get order history" });
  }
});

module.exports = router;
