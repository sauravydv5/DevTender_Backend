const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// signup API
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req.body);
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();
    const token = savedUser.getJWT();

    // set cookie (for normal browser)
    res.cookie("token", token, {
      httpOnly: true, // secure if HTTPS
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict", // or "Lax" or "None" for cross-site
      expires: new Date(Date.now() + 8 * 3600000),
    });

    // also send in JSON for mobile/localStorage
    res.status(201).json({
      message: "User added successfully!",
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        emailId: savedUser.emailId,
      },
    });
  } catch (err) {
    res.status(400).json({ message: "Error Saving user: " + err.message });
  }
});
