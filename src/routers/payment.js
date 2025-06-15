const express = require("express");
const userAuth = require("../middleware/auth");

const paymentRouter = express.Router();
const instance = require("../utils/razorpay");
const Razorpay = require("razorpay");
const Payment = require("../models/payment");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    const order = await instance.orders.create({
      amount: 2000, // in paisa
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    console.log(order);

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

    res.json({
      ...savedPayment.toJSON(), // sending the payment details to the client
    });
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({ error });
  }
});

module.exports = paymentRouter;
