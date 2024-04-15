// Import required modules
const jwt = require("jsonwebtoken");
const CustomErrorApi = require("../err/err");
const crypto = require("crypto");

// Define a function to generate authentication token
const generateAuthToken = (user) => {
  // Extract user id and email from the user object
  const { id, email } = user;
  // Generate a random jti (JWT ID)
  const jti = crypto.randomBytes(32).toString("hex");

  // Sign the token using JWT with the provided user information, access key, and expiration time
  const access_token = jwt.sign({ id, email }, process.env.access_key, {
    expiresIn: "100d",
    jwtid: jti,
  });

  // Return the access token and jti
  return {
    access_token: access_token,
    jti,
  };
};

// Define a function to verify the token
const verify = (token) => {
  // Verify the token using JWT and the refresh key
  const decode = jwt.verify(token, process.env.refresh_key);

  // If the token is not valid, throw a custom error
  if (!decode) {
    throw new CustomErrorApi("Login again ", 400);
  }

  // Return the decoded token
  return decode;
};

// Export the generateAuthToken function for use in other modules
module.exports = generateAuthToken;
