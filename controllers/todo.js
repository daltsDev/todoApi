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
  reqUser.todos.push(todoResponse._id);

  // Save user to the database
  await reqUser.save();

  // Send the user back a response with the newly created Todo and _id
  res.json({ todo: todoResponse.todo, id: todoResponse._id });
};

exports.editTodo = async (req, res, next) => {
  // Get incoming request data | ID of Todo to be modified | ID of the incoming User | new Todo Content
  const todoId = req.params.id;
  const userId = req.user._id;
  const todoContent = req.body.todo;

  // Find Todo
  const todo = await Todo.findById({ _id: todoId });
  console.log(todo);

  // Check if todo exists
  if (!todo) return res.status(404).json({ message: `No todo found with id ${todoId}` });

  // Check if todo creator matches todo userId
  if (todo.userId.toString() !== userId.toString()) return res.status(401).json({ message: `Unauthorized` });

  // Update todo
  todo.todo = todoContent;

  // Save Todo To Database
  await todo.save({ timestamps: true });

  // Return new todo
  res.status(200).json({ _id: todo._id, todo: todo.todo });

  //later | Check if todo exists check if owner of todo is the same as req user
};

exports.deleteTodo = async (req, res, next) => {
  // Get incoming request data | ID of Todo to be modified | ID of the incoming User
  const todoId = req.params.id;
  const userId = req.user._id;

  // Find Todo
  const todo = await Todo.findById({ _id: todoId });

  // Check if todo exists
  if (!todo) return res.status(404).json({ message: `No todo found with id ${todoId}` });

  // Check if todo creator matches todo userId
  if (todo.userId.toString() !== userId.toString()) return res.status(401).json({ message: `Unauthorized` });

  // Find User in Database
  const user = await User.findById({ _id: userId });

  // Create new Todo Array Excluding deleted Todo
  const updatedTodoArray = user.todos.filter((todo) => todo.toString() !== todoId.toString());

  // Set User Todo Array to new array excluding deleted array
  user.todos = updatedTodoArray;

  // Save User
  await user.save({ timestamps: true });

  // Delete Todo After Checks
  await Todo.deleteOne({ _id: todoId });

  // Return Deletion Confirmation
  res.status(200).json({ message: "Successfully Deleted Todo" });

  //later | Check if todo exists check if owner of todo is the same as req user
};
