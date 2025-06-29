const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token; // try cookie

    // if no cookie, try Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ error: "Please login!" });

    const decodedObj = jwt.verify(token, "DEVTinder@790"); // replace with env
    const user = await User.findById(decodedObj.id || decodedObj._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: " + err.message });
  }
};

module.exports = userAuth;
