const jwt = require("jsonwebtoken");
const { TwoUser } = require("../model/model");
async function authMiddleware(req, res, next) {
  const allowedPaths = [
    "/signup",
    "/login",
    "/login/",
    "/signup/",
  ];
  const authHeader = req.headers.auth_token;
  
  if (!authHeader) {
    if (allowedPaths.includes(req.path)) return next();
    return res.status(401).json({ message: "Log in to view this page" });
  }
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.access_key);
  
    const result = await TwoUser.findOne({
      _id: decoded.id,
      "token_detail.jti": decoded.jti,
    });
    if (result && result.token_detail.jti === decoded.jti) {
      if (allowedPaths.includes(req.path))
        return res.status(200).json({ message: "Already Logged in" });
      else {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          firstname: result.firstname,
          lastname: result.lastname,
        };
        return next();
      }
    } else {
      if (allowedPaths.includes(req.path)) return next();
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

module.exports = authMiddleware;
