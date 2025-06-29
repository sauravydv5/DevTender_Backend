const express = require("express");
const crypto = require("crypto");
const userAuth = require("../middleware/auth");
const Payment = require("../models/payment");
const instance = require("../utils/razorpay"); // configured Razorpay instance

const paymentRouter = express.Router();

/**
 * @route   POST /payment/create
 * @desc    Create Razorpay order with correct amount based on membership type
 * @access  Protected
 */
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    // ✅ Dynamic amount based on membership type
    let amount;
    switch (membershipType) {
      case "Bronze":
        amount = 39900; // ₹399 in paisa
        break;
      case "Silver":
        amount = 64900; // ₹649 in paisa
        break;
      case "Gold":
        amount = 104900; // ₹1049 in paisa
        break;
      default:
        return res.status(400).json({ error: "Invalid membership type" });
    }

    const order = await instance.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { firstName, lastName, emailId, membershipType },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

/**
 * @route   GET /payment/:orderId
 * @desc    Fetch payment by orderId
 * @access  Protected
 */
paymentRouter.get("/payment/:orderId", userAuth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
    });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

/**
 * @route   POST /payment/verify
 * @desc    Verify payment signature from Razorpay
 * @access  Protected
 */
paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const secret = "qbTCh0Ufcuqeq6lXbf98uzGq"; // ⚠️ Use process.env.RAZORPAY_SECRET in production
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "paid", paymentId: razorpay_payment_id }
      );
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

module.exports = paymentRouter;
