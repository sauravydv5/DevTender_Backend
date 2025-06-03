const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.ROZERPAY_KEYID,
  key_secret: process.env.ROZERPAY_KEY_SECRET,
});

module.exports = instance;
