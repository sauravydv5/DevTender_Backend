const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const http = require("http");

dotenv.config();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"], // add production URL here
    credentials: true,
  })
);

// middleware
app.use(express.json());
app.use(cookieParser());

// routers
app.use("/", require("./routers/auth"));
app.use("/", require("./routers/profile"));
app.use("/", require("./routers/request"));
app.use("/", require("./routers/user"));
app.use("/", require("./routers/payment"));

// socket
const initializeSocket = require("./utils/socket");
const server = http.createServer(app);
initializeSocket(server);

// connect DB and start server
connectDB()
  .then(() => {
    console.log("Database Connected successfully...");
    server.listen(port, () => {
      console.log(`Server is running Successfully on PORT ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected..", err);
    process.exit(1);
  });
