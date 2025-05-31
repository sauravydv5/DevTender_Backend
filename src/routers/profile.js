const express = require("express");
const profileRouter = express.Router();

const User = require("../models/user");
const userAuth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { validateEditProfileData } = require("../utils/validation");

//Profileview Api
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user; // Set by userAuth middleware

    res.send(user);
  } catch (err) {
    res.status(401).send({ error: "Unauthorized: Invalid or expired token" });
  }
});

// Profile Edit API
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();

    res.send("Profile updated successfully!");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
