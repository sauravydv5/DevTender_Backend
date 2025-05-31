const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://sauravkumar91937:qazxswedc@devtinderbe.ofs0ffx.mongodb.net/DevTinderBackEnd"
  );
};

module.exports = connectDB;
