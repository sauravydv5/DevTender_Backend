const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

//middleware
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database Connected successfully...");
    app.listen(3000, () => {
      console.log("Server is running Successfully on PORT 3000..");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected..");
  });
