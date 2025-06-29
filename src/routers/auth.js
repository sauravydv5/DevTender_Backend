const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//signup Api
authRouter.post("/signup", async (req, res) => {
  try {
    //Validate of data...

    validateSignUpData(req.body);

    const { firstName, lastName, emailId, password } = req.body;

    //Encrypt the Password

    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);

    // creating a new instane of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "user added sucessfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("Error Saving the user:" + err.message);
  }
});

//login Api

// authRouter.post("/login", async (req, res) => {
//   try {
//     const { emailId, password } = req.body;

//     const user = await User.findOne({ emailId: emailId });
//     if (!user) {
//       throw new Error("Invalid credentials");
//     }
//     const isPasswordValid = await user.validatePassword(password);

//     if (isPasswordValid) {
//       const token = await user.getJWT();

//       res.cookie("token", token, {
//         expires: new Date(Date.now() + 8 * 3600000),
//       });
//       res.send(user);
//     } else {
//       throw new Error("Invalid credentials");
//     }
//   } catch (err) {
//     res.status(400).send("ERROR : " + err.message);
//   }
// });

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
      },
    });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

//logout APi
// authRouter.post("/logout", async (req, res) => {
//   res.cookie("token", null, {
//     expires: new Date(Date.now()),
//   });
//   res.send("Logout Successful!!");
// });

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(Date.now()),
  });
  res.send("Logout successful!");
});

module.exports = authRouter;
