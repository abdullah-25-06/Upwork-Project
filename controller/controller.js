const asynchandler = require("express-async-handler");
const {
  TwoUser,
  Documentation,
  Maintenance,
  Vehicle,
} = require("../model/model");
const CustomErrorApi = require("../err/err");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const generateAuthToken = require("../jwt/jwt");
const { parsePhoneNumber } = require("awesome-phonenumber");

const signupuser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res
        .status(400)
        .json({ msg: "PLease fill all the required fields" });
    const exists = await TwoUser.findOne({ email });

    if (exists) return res.status(400).json({ msg: "Enter a unique email" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const session = await mongoose.startSession();
    session.startTransaction();

    const fuser = await TwoUser.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    if (!fuser) {
      throw new CustomErrorApi("Can't Register right now", 400);
    }

    const { access_token, jti } = generateAuthToken(fuser);

    const token = await TwoUser.findByIdAndUpdate(
      { _id: fuser._id },
      { token_detail: { access_token, jti } }
    );
    await session.commitTransaction();

    return res.status(201).json({
      msg: "User Created",
      username: fuser.username,
      token: { access_token },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "User Not Created" });
  }
};
// =-----------------------------------------------------------------------------------------------
const login = asynchandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Enter your email and password" });

  const user = await TwoUser.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const { access_token, jti } = generateAuthToken(user);

    const token = await TwoUser.findByIdAndUpdate(
      { _id: user._id },
      { token_detail: { access_token, jti } }
    );
    if (!token) {
      return res.status(400).json({ msg: "Try to login again" });
    }
    return res.status(200).json({
      access_token,
      username: user.username,
    });
  }
  return res.status(400).json({ msg: "Invalid email or password" });
});

// ----------------------------------------------
const logout = asynchandler(async (req, res) => {
  const user = await TwoUser.findByIdAndUpdate(
    { _id: req.user.id },
    { token_detail: { access_token: null, jti: null } },
    { new: true }
  );

  if (!user) {
    throw new CustomErrorApi("Invalid", 403);
  }
  return res.status(201).json({ msg: "Logout successful" });
});
// ----------------------------------------------
const addVehicle = async (req, res) => {
  try {
    const { make, model, year, vehicleNo, chasisNo, FuelType, images } =
      req.body;

    if (
      !make ||
      !model ||
      !year ||
      !vehicleNo ||
      !chasisNo ||
      !FuelType ||
      !images
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    const user = await TwoUser.findOne({ email: req.user.email });
    const vehicle = await Vehicle.create({
      make,
      model,
      year,
      vehicleNo,
      chasisNo,
      FuelType,
      images,
      userId: user.id,
    });
    if (!vehicle) return res.status(400).json({ msg: "Please try again" });
    return res.status(201).json({ msg: "Vehicle has been successfully added" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Please try again" });
  }
};
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    // const user = await TwoUser.findOne({ email: req.user.email });
    await Vehicle.findByIdAndDelete({
      _id: id,
    });
    // if (!vehicle) return res.status(400).json({ msg: "Please try again" });
    return res.status(201).json({ msg: "Vehicle deleted successfully " });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Please try again" });
  }
};
const updateVehicle = async (req, res) => {
  try {
    const { make, model, year, vehicleNo, chasisNo, FuelType, images } =
      req.body;
    const user = await TwoUser.findOne({ email: req.user.email });
    const vehicle = await Vehicle.findByIdAndUpdate(
      { _id: req.query.id },
      {
        make,
        model,
        year,
        vehicleNo,
        chasisNo,
        FuelType,
        images,
        userId: user.id,
      },
      {
        new: true,
      }
    );
    if (!vehicle) return res.status(400).json({ msg: "Please try again" });
    return res.status(200).json({ vehicle: vehicle });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Please try again" });
  }
};
const getDetail = async (req, res) => {
  try {
    const user = await TwoUser.findOne({ email: req.user.email }).select(
      "firstName lastName email"
    );
    const vehicle = await Vehicle.find({ userId: user.id });
    if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
    return res.status(200).json({ user: user, vehicle: vehicle });
  } catch (err) {
    return res.status(400).json({ msg: "Please try again" });
  }
};
const addMaintance = async (req, res) => {
  try {
    const { kilometer, days, amount, odometer, date, reminder } = req.body;
    const car = await Vehicle.findOne({ _id: req.query.id });
    const car_second = await Maintenance.findOne({ vehicle: car._id });

    if (car_second) {
      const vehicle = await Maintenance.findOneAndUpdate(
        { vehicle: car._id },
        {
          kilometer,
          days,
          amount,
          odometer,
          date,
          reminder,
          vehicle: car.id,
        },
        { new: true }
      );
      if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
      return res.status(200).json({ vehicle: vehicle });
    }
    const vehicle = await Maintenance.create({
      kilometer,
      days,
      amount,
      odometer,
      date,
      reminder,
      vehicle: car.id,
    });
    if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
    return res.status(200).json({ vehicle: vehicle });
  } catch (err) {
    return res.status(400).json({ msg: "Please try again" });
  }
};
const addDocument = async (req, res) => {
  try {
    const {
      vehicleNo,
      name,
      documentNo,
      startDate,
      endDate,
      reminders,
      reminderDays,
    } = req.body;

    const car = await Vehicle.findOne({ _id: req.query.id });
    const car_second = await Documentation.findOne({ vehicle: car._id });

    if (car_second) {
      const vehicle = await Documentation.findOneAndUpdate(
        { vehicle: car._id },
        {
          vehicleNo,
          name,
          documentNo,
          startDate,
          endDate,
          reminders,
          reminderDays,
          vehicle: car.id,
        },
        { new: true }
      );
      if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
      return res.status(200).json({ vehicle: vehicle });
    }
    const vehicle = await Documentation.create({
      vehicleNo,
      name,
      documentNo,
      startDate,
      endDate,
      reminders,
      reminderDays,
      vehicle: car.id,
    });
    if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
    return res.status(200).json({ vehicle: vehicle });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Please try again" });
  }
};
const getVehicle = async (req, res) => {
  try {
    const car = await Vehicle.findOne({ _id: req.query.id });
    const car_second = await Maintenance.findOne({ vehicle: car._id });

    if (!car_second) return res.status(400).json({ msg: "No vehicle" });
    return res.status(200).json({ vehicle: car_second });
  } catch (error) {
    return res.status(400).json({ msg: "Please try again" });
  }
};
const getDocument = async (req, res) => {
  try {
    const car = await Vehicle.findOne({ _id: req.query.id });
    const car_second = await Documentation.findOne({ vehicle: car._id });

    if (!car_second) return res.status(400).json({ msg: "No vehicle" });
    return res.status(200).json({ vehicle: car_second });
  } catch (error) {
    return res.status(400).json({ msg: "Please try again" });
  }
};
module.exports = {
  signupuser,
  logout,
  login,
  addVehicle,
  getDetail,
  addMaintance,
  addDocument,
  getDocument,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
