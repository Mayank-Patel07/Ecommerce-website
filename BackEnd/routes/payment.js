const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");

// Setup env variables
dotenv.config({
  path: "../.env",
});

// Initialize Razorpay instance
// The Razorpay instance is created using the key_id and key_secret from the environment variables
// The key_id and key_secret are used to authenticate requests to the Razorpay API
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/razorpay - Create a new Razorpay order
// This endpoint is used to create a new Razorpay order. It expects the amount in the request body and returns the order details.
router.post("/razorpay", async (req, res) => {
  try {
    // Validate the request body
    const { amount } = req.body;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await instance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// POST /api/payment/verify - Verify Razorpay payment signature
// This endpoint is used to verify the Razorpay payment signature. It expects the razorpay_order_id, razorpay_payment_id, and razorpay_signature in the request body.
// The signature is generated using the HMAC SHA256 algorithm with the order ID and payment ID
// and the secret key. If the signature is valid, it fetches the payment details and checks if the payment status is "captured".
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  // Generate expected signature
  // The expected signature is generated using the HMAC SHA256 algorithm with the secret key and the order ID and payment ID
  // The createHmac function creates a HMAC hash using the specified algorithm and key
  // The update function updates the hash with the specified data
  // The digest function calculates the final hash and returns it in the specified encoding (hex)
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      const payment = await instance.payments.fetch(razorpay_payment_id);

      if (payment.status === "captured") {
        // TODO  Save payment/order details to DB
        return res.json({ success: true });
      } else {
        return res.json({ success: false, error: "Payment not captured" });
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      return res
        .status(500)
        .json({ success: false, error: "Payment fetch failed" });
    }
  } else {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
});

module.exports = router;
