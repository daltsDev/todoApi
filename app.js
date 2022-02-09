const mongoose = require("mongoose");
const express = require("express");
const db = require("./utils/db");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");
let GLOBAL_MONGO_SERVER;
// Create Application Instance
const app = express();

// Enable Express App to parse incoming JSON
app.use(express.json());

// app.use('/auth', authRoutes)
app.use("/todos", todoRoutes);

db.connect()
  .then(() => {
    app.listen(8080, () => {
      console.log("Running...");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// MongoMemoryServer.create({
//     instance: {
//       port: 27018, // by default choose any free port
//     }}).then(mongoServer => {
//         GLOBAL_MONGO_SERVER = mongoServer;
//         mongoose.connect(mongoServer.getUri(), { dbName: "todo" })
//     .then((_) => {
//         app.listen(8080, () => {
//             console.log("Running...")
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

process.on("SIGTERM", async () => {
  console.log("SHUTTING ME DOWN FORCEFULLY");
  await mongoose.disconnect();
  await GLOBAL_MONGO_SERVER.stop();
  process.exit(1);
});
process.on("SIGINT", async () => {
  console.log("SHUTTING ME DOWN GRACEFULLY");
  await mongoose.disconnect();
  await GLOBAL_MONGO_SERVER.stop();
  process.exit(0);
});
