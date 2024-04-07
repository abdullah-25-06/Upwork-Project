const express = require("express");
const userRouter = express.Router();
const {
  signupuser,
  login,
  logout,
  addVehicle,
  getDetail,
  addMaintance,
  addDocument,
  getDocument,
  updateVehicle,
  deleteVehicle,
} = require("../controller/controller");
const authMiddleware = require("../middleswares/auth");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });
userRouter.route("/signup").post(authMiddleware, signupuser);
userRouter.route("/login").post(authMiddleware, login);
userRouter.route("/logout").post(authMiddleware, logout);
userRouter.route("/vehicle").post(authMiddleware, addVehicle);
userRouter.route("/delete").post(authMiddleware, deleteVehicle);
userRouter.route("/update").post(authMiddleware, updateVehicle);
userRouter.route("/detail").get(authMiddleware, getDetail);
userRouter.route("/maintance").post(authMiddleware, addMaintance);
userRouter
  .route("/doc")
  .post(authMiddleware, upload.single("file"), addDocument);
userRouter.route("/getmaintance").get(authMiddleware, addMaintance);
userRouter.route("/getdoc").get(authMiddleware, getDocument);

module.exports = userRouter;
