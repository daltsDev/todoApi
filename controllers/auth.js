const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET_TOKEN } = process.env;

exports.signUp = async (req, res, next) => {
  // Handle validation errors
  // Validation Error Handling
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    // Get Request Body Parameters

    const { email, password } = req.body;
    // encrypt password

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
      todos: [],
    });

    // save user to database
    await newUser.save({ timestamps: true });

    // confirm user sign up.
    res.status(201).json({ message: "Successfully Signed Up", id: newUser._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  // Handle validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    // Gather request Parameters
    const { email, password } = req.body;

    // Compare password with stored password
    const userToLogin = await User.findOne({ email: email });

    const isCorrectPassword = bcrypt.compare(password, userToLogin.password);

    if (isCorrectPassword) {
      // Create jwt
      const token = jwt.sign({ userId: userToLogin._id }, JWT_SECRET_TOKEN, { expiresIn: "7 days" });
      // Return jwt
      res.status(200).json({ accessToken: token });
    } else {
      const error = new Error("Incorrect Password");
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
