const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

const { JWT_SECRET_TOKEN } = process.env;

module.exports = async (req, res, next) => {
  // Handle incoming request headers
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    return next(error);
  }
  // Grab Token
  const token = authHeader.split(" ")[1];
  // Initiate tmp variable
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, JWT_SECRET_TOKEN);
  } catch (error) {
    error.statusCode = 500;
    return next(error);
  }

  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    return next(error);
  }

  req.userId = decodedToken.userId;
  next();
};
