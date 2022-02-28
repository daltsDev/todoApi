const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

// Import DATABASE URI
const DATABASE_URI = process.env.DATABASE_URI;

// Create Application Instance
const app = express();

// Enable Express App to parse incoming JSON
app.use(express.json());

// Adding Config for CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ROUTES
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);

// Global APP ERROR HANDLER

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

//DATABASE CONNECTION
mongoose
  .connect(DATABASE_URI, { maxPoolSize: 50 })
  .then((_) => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });

// Handle Shutting down of the application

process.on("SIGTERM", async () => {
  console.log("SHUTTING ME DOWN FORCEFULLY");
  await mongoose.disconnect();
  process.exit(1);
});
process.on("SIGINT", async () => {
  console.log("SHUTTING ME DOWN GRACEFULLY");
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = app;
