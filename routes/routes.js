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

userRouter.route("/signup").post(authMiddleware, signupuser);
userRouter.route("/login").post(authMiddleware, login);
userRouter.route("/logout").post(authMiddleware, logout);
userRouter.route("/vehicle").post(authMiddleware, addVehicle);
userRouter.route("/delete").post(authMiddleware, deleteVehicle);
userRouter.route("/update").post(authMiddleware, updateVehicle);
userRouter.route("/detail").get(authMiddleware, getDetail);
userRouter.route("/maintance").post(authMiddleware, addMaintance);
userRouter.route("/doc").post(authMiddleware, addDocument);
userRouter.route("/getmaintance").get(authMiddleware, addMaintance);
userRouter.route("/getdoc").get(authMiddleware, getDocument);

module.exports = userRouter;
