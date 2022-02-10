const mongoose = require("mongoose");
const Todo = require("../models/todo");
const User = require("../models/user");

const PROJECTION = { userId: 0, createdAt: 0, updatedAt: 0, __v: 0 };

exports.getTodo = async (req, res, next) => {
  const userId = req.user._id;

  const todoList = await Todo.find({ userId: userId }, PROJECTION);

  res.send(todoList);
};

exports.getATodo = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const todo = await Todo.findOne({ _id: id, userId: userId }, PROJECTION);
  res.json(todo);
};

exports.createTodo = async (req, res, next) => {
  // Get incoming request data
  const userId = req.user._id;
  const todoContent = req.body.todo;

  // Create a new Mongoose Todo model
  const todo = new Todo({
    todo: todoContent,
    userId: userId,
  });

  // Save the Response in the database and retreive back the entire todo object
  const todoResponse = await todo.save();

  // Find and return the request user object in the database
  const reqUser = await User.findById(todo.userId);

  // Push new TODO _id in to User Todo array
  reqUser.todo.push(todoResponse._id);

  // Save user to to the database
  await reqUser.save();

  // Send the user back a response with the newly created Todo and _id
  res.json({ todo: todoResponse.todo, id: todoResponse._id });
};
