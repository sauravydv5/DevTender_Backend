const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const http = require("http");
const port = process.env.PORT || 5000;
dotenv.config();

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
const paymentRouter = require("./routers/payment");
const initializeSocket = require("./utils/socket");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database Connected successfully...");
    server.listen(port || 3000, () => {
      console.log(`Server is running Successfully on PORT ${process.env.port}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected..");
  });
