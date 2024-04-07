const express = require("express");
const userRouter = require("./routes/routes");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const { connectdb } = require("./DB/connect");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));
app.use("/", userRouter);

const start = async () => {
  try {
    app.listen(8000, () =>
      console.log("server is listening on http://localhost:8000")
    );
    await connectdb();
  } catch (error) {
    console.log(error);
  }
};
start();
