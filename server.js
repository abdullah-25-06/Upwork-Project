const express = require("express");
const userRouter = require("./routes/routes");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const { connectdb } = require("./DB/connect");

// Enable CORS
app.use(cors());

// Parse JSON requests with a limit of 10mb
app.use(express.json({ limit: "10mb" }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Route requests to the userRouter
app.use("/", userRouter);

// Start the server and connect to the database
const start = async () => {
  try {
    app.listen(8000, () =>
      console.log("Server is listening on http://localhost:8000")
    );
    await connectdb();
  } catch (error) {
    console.log(error);
  }
};
start();
