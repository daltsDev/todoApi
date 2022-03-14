const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

const { dbConn, dbShutDown } = require("./db/db");

const app = express();
app.use(express.json());

/**
 * Add Express Configuration for CORS Support.
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/**
 * Implement Express Routing
 */
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);

/**
 * Initialization of Global Error Handler
 */
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

/**
 * Instantiation of Database Connection
 */
dbConn().then((URI) => {
  let connectionString = `${URI}todo-${process.env.ENV}`;
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.emit("Connected To Database");
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * Global Shutdown Handlers
 */
process.on("SIGTERM", async () => {
  app.emit("shutting me down forcefully");
  await mongoose.disconnect();
  await dbShutDown();
  process.exit(1);
});
process.on("SIGINT", async () => {
  app.emit("shutting me down gracefully");
  await mongoose.disconnect();
  await dbShutDown();
  process.exit(0);
});

/**
 * Export the Express App to
 * be able to utilise Supertest
 * testing suit.
 */

module.exports = app;
