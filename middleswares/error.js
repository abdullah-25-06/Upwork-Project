// Import CustomErrorApi module
const CustomErrorApi = require("../err/err.js");

// Define error handling middleware function
const error = (err, req, res, next) => {
  // If the error is an instance of CustomErrorApi
  if (err instanceof CustomErrorApi) {
    // Return the custom error message and status code
    return res.status(err.statusCode).json({ error: err.message });
  }
  // If it's not a custom error, return a generic error message and status code
  return res.status(500).json("Couldn't process the request");
};

// Export the error handling middleware function
module.exports = error;
