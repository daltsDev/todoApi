const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const User = require("./models/user");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

const DATABASE_URI = process.env.DATABASE_URI;
const PORT = process.env.PORT;

// Create Application Instance
const app = express();

// Enable Express App to parse incoming JSON
app.use(express.json());

// DEV ONLY manually assinging user to single user for all requests
app.use((req, res, next) => {
  User.findById("62043534e418cb44305723de")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// ROUTES
// app.use('/auth', authRoutes)
app.use("/todo", todoRoutes);

//DATABASE CONNECTION
mongoose
  .connect(DATABASE_URI)
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          email: "daltsdev@icloud.com",
          password: "password",
          todo: [],
        });
        user.save();
      }
    });
    app.listen(PORT || 8080);
    console.log("Connected to Database & App Running");
  })
  .catch((err) => {
    console.log(err);
  });

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
