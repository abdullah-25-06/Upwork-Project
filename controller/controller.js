// Import necessary modules and models
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

// Function to handle user signup
const signupuser = async (req, res) => {
  try {
    // Extract user details from request body
    const { firstName, lastName, email, password } = req.body;

    // Check if all required fields are filled
    if (!firstName || !lastName || !email || !password)
      return res
        .status(400)
        .json({ msg: "Please fill all the required fields" });

    // Check if email already exists
    const exists = await TwoUser.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Enter a unique email" });

    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const session = await mongoose.startSession();
    session.startTransaction();

    // Create new user
    const fuser = await TwoUser.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    // Handle registration errors
    if (!fuser) {
      throw new CustomErrorApi("Can't Register right now", 400);
    }

    // Generate authentication token
    const { access_token, jti } = generateAuthToken(fuser);

    // Save token details to the user
    const token = await TwoUser.findByIdAndUpdate(
      { _id: fuser._id },
      { token_detail: { access_token, jti } }
    );
    await session.commitTransaction();

    // Respond with success message and token
    return res.status(201).json({
      msg: "User Created",
      username: fuser.username,
      token: { access_token },
    });
  } catch (error) {
    // Handle errors during signup
    console.log(error);
    return res.status(400).json({ msg: "User Not Created" });
  }
};

// Function to handle user login
const login = asynchandler(async (req, res, next) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password)
    return res.status(400).json({ msg: "Enter your email and password" });

  // Find user by email
  const user = await TwoUser.findOne({ email });

  // Compare passwords and generate token if credentials are valid
  if (user && (await bcrypt.compare(password, user.password))) {
    const { access_token, jti } = generateAuthToken(user);

    // Save token details to the user
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

// Function to handle user logout
const logout = asynchandler(async (req, res) => {
  // Find user and update token details to null
  const user = await TwoUser.findByIdAndUpdate(
    { _id: req.user.id },
    { token_detail: { access_token: null, jti: null } },
    { new: true }
  );

  // Handle invalid user
  if (!user) {
    throw new CustomErrorApi("Invalid", 403);
  }
  return res.status(201).json({ msg: "Logout successful" });
});

// Function to add a new vehicle
const addVehicle = async (req, res) => {
  try {
    // Extract vehicle details from request body
    const { make, model, year, vehicleNo, chasisNo, FuelType, images } =
      req.body;

    // Check if all fields are provided
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
    // Find user by email
    const user = await TwoUser.findOne({ email: req.user.email });

    // Create new vehicle
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
    // Handle errors during vehicle creation
    if (!vehicle) return res.status(400).json({ msg: "Please try again" });
    return res.status(201).json({ msg: "Vehicle has been successfully added" });
  } catch (error) {
    // Handle errors
    console.log(error);
    return res.status(400).json({ msg: "Please try again" });
  }
};

// Function to delete a vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    // Delete vehicle by ID
    await Vehicle.findByIdAndDelete({
      _id: id,
    });
    return res.status(201).json({ msg: "Vehicle deleted successfully " });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Please try again" });
  }
};

// Function to update vehicle details
const updateVehicle = async (req, res) => {
  try {
    // Extract vehicle details from request body
    const { make, model, year, vehicleNo, chasisNo, FuelType, images } =
      req.body;
    // Find user by email
    const user = await TwoUser.findOne({ email: req.user.email });

    // Update vehicle details
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

// Function to get user details along with associated vehicles
const getDetail = async (req, res) => {
  try {
    // Find user by email and select specific fields
    const user = await TwoUser.findOne({ email: req.user.email }).select(
      "firstName lastName email"
    );
    // Find vehicles associated with the user
    const vehicle = await Vehicle.find({ userId: user.id });
    if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
    return res.status(200).json({ user: user, vehicle: vehicle });
  } catch (err) {
    return res.status(400).json({ msg: "Please try again" });
  }
};

// Function to add maintenance details for a vehicle
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

// Function to add document details for a vehicle
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
          originalname: req.file.originalname,
          filename: req.file.filename,
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
      originalname: req.file.originalname,
      filename: req.file.filename,
      vehicle: car.id,
    });
    if (!vehicle) return res.status(200).json({ msg: "No vehicle" });
    return res
      .status(200)
      .json({ vehicle: { originalname: req.file.originalname } });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Please try again" });
  }
};

// Function to get maintenance details for a vehicle
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

// Function to get document details for a vehicle
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

// Export all functions for use in other modules
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
