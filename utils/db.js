const mongoose = require("mongoose");

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Provide connection to a new in-memory database server.
const connect = async () => {
  // NOTE: before establishing a new connection close previous
  await mongoose.disconnect();

  await mongoose.connect("mongodb://localhost:27017/todo", opts, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Connected to Database");
  });
};

// Remove and close the database and server.
const close = async () => {
  await mongoose.disconnect();
};

// Remove all data from collections
const clear = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

module.exports = {
  connect,
  close,
  clear,
};
