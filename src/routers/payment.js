const express = require("express");
const userAuth = require("../middleware/auth");

const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: 2000, // in paisa
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: "value3",
        lastName: "value2",
        membershipType: "silver",
      },
    });

    console.log(order);

    res.status(201).json({
      message: "Payment created successfully",
      order,
    });
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = paymentRouter;
