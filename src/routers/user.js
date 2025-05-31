const express = require("express");
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

const USER_SAVE_DATA = "firstName lastName age photoUrl about gender skills";

//Get all the pending connection requst for the loggedIn User..
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAVE_DATA);

    res.json({
      message: "Data fetched successfully.",
      data: connectionRequests,
    });
  } catch (err) {
    console.error("Error fetching requests:", err.message);
    res.status(404).json({
      message: "User not found!",
    });
  }
});

//User Connection
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAVE_DATA)
      .populate("toUserId", USER_SAVE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: "ERROR" + err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const HideUserFromFeed = new Set();

    connectionRequests.forEach((req) => {
      if (req.fromUserId.toString() !== loggedInUser._id.toString()) {
        HideUserFromFeed.add(req.fromUserId.toString());
      }
      if (req.toUserId.toString() !== loggedInUser._id.toString()) {
        HideUserFromFeed.add(req.toUserId.toString());
      }
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(HideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAVE_DATA)
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
