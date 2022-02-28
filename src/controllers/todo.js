const { validationResult } = require("express-validator");
const Todo = require("../models/todo");
const User = require("../models/user");

const PROJECTION = { userId: 0, createdAt: 0, updatedAt: 0, __v: 0 };

exports.getTodos = async (req, res, next) => {
  const userId = req.userId;

  const todoList = await Todo.find({ userId: userId }, PROJECTION);

  res.send(todoList);
};

exports.getTodo = async (req, res, next) => {
  // Validation Error Handling
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    // Get Request Parameters
    const { id } = req.params;
    const userId = req.userId;
    // Find Todo
    const todo = await Todo.findOne({ _id: id });

    // Check if todo exists
    if (todo) {
      // Check if user is owner of todo
      if (todo.userId.toString() !== userId.toString()) {
        const error = new Error(
          "You do not have permissions to perform this action"
        );
        error.statusCode = 403;
        throw error;
      }
    } else {
      const error = new Error(`No todo found with ID ${id}. Please check ID.`);
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ _id: todo._id, todo: todo.todo });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.createTodo = async (req, res, next) => {
  // Validation Error Handling
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  try {
    // Get incoming request data
    const userId = req.userId;
    const todoContent = req.body.todo;

    // Create a new Mongoose Todo model
    const todo = new Todo({
      todo: todoContent,
      userId: userId,
    });

    // Save the Response in the database and retrieve back the entire todo object
    const todoResponse = await todo.save();

    // Find and return the request user object in the database
    const reqUser = await User.findById(todo.userId);

    // Push new TODO _id in to User Todo array
    reqUser.todos.push(todoResponse._id);

    // Save user to the database
    await reqUser.save();

    // Send the user back a response with the newly created Todo and _id
    res.json({ todo: todoResponse.todo, _id: todoResponse._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.editTodo = async (req, res, next) => {
  // Validation Error Handling
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    // Get incoming request data | ID of Todo to be modified | ID of the incoming User | new Todo Content
    const todoId = req.params.id;
    const userId = req.userId;
    const todoContent = req.body.todo;

    // Find Todo
    const todo = await Todo.findById({ _id: todoId });

    // Check if todo exists
    if (todo) {
      // Check if user is owner of todo
      if (todo.userId.toString() !== userId.toString()) {
        const error = new Error(
          "You do not have permissions to perform this action"
        );
        error.statusCode = 403;
        throw error;
      }
    } else {
      const error = new Error(
        `No todo found with ID ${todoId}. Please check ID.`
      );
      error.statusCode = 404;
      throw error;
    }

    // Update todo
    todo.todo = todoContent;

    // Save Todo To Database
    await todo.save({ timestamps: true });

    // Return new todo
    res.status(200).json({ _id: todo._id, todo: todo.todo });

    //later | Check if todo exists check if owner of todo is the same as req user
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.deleteTodo = async (req, res, next) => {
  // Validation Error Handling
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    // Get incoming request data | ID of Todo to be modified | ID of the incoming User
    const todoId = req.params.id;
    const userId = req.userId;

    // Find Todo
    const todo = await Todo.findById({ _id: todoId });

    // Check if todo exists
    if (todo) {
      // Check if user is owner of todo
      if (todo.userId.toString() !== userId.toString()) {
        const error = new Error(
          "You do not have permissions to perform this action"
        );
        error.statusCode = 403;
        throw error;
      }
    } else {
      const error = new Error(
        `No todo found with ID ${todoId}. Please check ID.`
      );
      error.statusCode = 404;
      throw error;
    }

    // Delete Todo After Checks
    await Todo.deleteOne({ _id: todoId });

    // Find User in Database
    const user = await User.findById({ _id: userId });

    // Remove Todo Id from user Todos
    user.todos.pull(todo._id);

    // Save User
    await user.save({ timestamps: true });

    // Return Deletion Confirmation
    res.status(200).json({ message: "Successfully Deleted Todo" });

    //later | Check if todo exists check if owner of todo is the same as req user
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
