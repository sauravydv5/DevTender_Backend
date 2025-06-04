const express = require("express");
const userAuth = require("../middleware/auth");

const paymentRouter = express.Router();
const instance = require("../utils/razorpay");
const Razorpay = require("razorpay");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const order = await instance.orders.create({
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
    res.status(500).json({ error });
  }
});

module.exports = paymentRouter;
