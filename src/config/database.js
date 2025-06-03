const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = async () => {
  await mongoose.connect(process.env.DB_CONNCETION);
};

module.exports = connectDB;
