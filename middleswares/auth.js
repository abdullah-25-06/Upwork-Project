// Import necessary modules
const jwt = require("jsonwebtoken");
const { TwoUser } = require("../model/model");

// Define authentication middleware function
async function authMiddleware(req, res, next) {
  // Define paths that do not require authentication
  const allowedPaths = [
    "/signup",
    "/login",
    "/login/",
    "/signup/",
  ];

  // Extract auth token from request headers
  const authHeader = req.headers.auth_token;

  // If no auth token is provided
  if (!authHeader) {
    // Check if the requested path is allowed
    if (allowedPaths.includes(req.path)) return next();
    // Otherwise, return unauthorized status
    return res.status(401).json({ message: "Log in to view this page" });
  }

  // Extract token from the authorization header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the access key
    const decoded = jwt.verify(token, process.env.access_key);

    // Find the user associated with the decoded token
    const result = await TwoUser.findOne({
      _id: decoded.id,
      "token_detail.jti": decoded.jti,
    });

    // If a valid user is found
    if (result && result.token_detail.jti === decoded.jti) {
      // If the requested path is allowed
      if (allowedPaths.includes(req.path))
        // Return a response indicating the user is already logged in
        return res.status(200).json({ message: "Already Logged in" });
      else {
        // Otherwise, set user information in the request object and proceed to the next middleware
        req.user = {
          id: decoded.id,
          email: decoded.email,
          firstname: result.firstname,
          lastname: result.lastname,
        };
        return next();
      }
    } else {
      // If the requested path is allowed, proceed to the next middleware
      if (allowedPaths.includes(req.path)) return next();
      // Otherwise, return unauthorized status
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } catch (err) {
    // If an error occurs during token verification, return unauthorized status
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

// Export the authentication middleware function
module.exports = authMiddleware;
