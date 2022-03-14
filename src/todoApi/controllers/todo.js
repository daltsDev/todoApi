const { validationResult } = require("express-validator");
const Todo = require("../models/todo");
const User = require("../models/user");

exports.getTodos = async (req, res, next) => {
  /**
   * Return all Todos
   */
  const userId = req.userId;
  let isVerbose = req.query.verbose;
  isVerbose = isVerbose == "true";
  const todoList = await Todo.find(
    { userId: userId },
    isVerbose
      ? { _id: 1, createdAt: 1, updatedAt: 1, todo: 1 }
      : { userId: 0, createdAt: 0, updatedAt: 0, __v: 0 }
  );
  res.send(todoList);
};

exports.getTodo = async (req, res, next) => {
  /**
   * Return a single Todos
   */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  try {
    const { id } = req.params;
    const userId = req.userId;
    let isVerbose = req.query.verbose;
    isVerbose = isVerbose == "true";
    const todo = await Todo.findOne({ _id: id });
    if (todo) {
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
    isVerbose
      ? res.json({
          _id: todo._id,
          todo: todo.todo,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        })
      : res.json({ todo: todo.todo, _id: todo._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.createTodo = async (req, res, next) => {
  /**
   * Create a Todo
   */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  try {
    const userId = req.userId;
    const todoContent = req.body.todo;
    let isVerbose = req.query.verbose;
    isVerbose = isVerbose == "true";
    const todo = new Todo({
      todo: todoContent,
      userId: userId,
    });
    const todoResponse = await todo.save();
    console.log(isVerbose);
    const reqUser = await User.findById(todo.userId);
    reqUser.todos.push(todoResponse._id);
    await reqUser.save();
    isVerbose
      ? res.json({
          _id: todoResponse._id,
          todo: todoResponse.todo,
          createdAt: todoResponse.createdAt,
          updatedAt: todoResponse.updatedAt,
        })
      : res.json({ todo: todoResponse.todo, _id: todoResponse._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.editTodo = async (req, res, next) => {
  /**
   * Modify a Todo
   */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  try {
    const todoId = req.params.id;
    const userId = req.userId;
    let isVerbose = req.query.verbose;
    isVerbose = isVerbose == "true";
    const todoContent = req.body.todo;
    const todo = await Todo.findById({ _id: todoId });
    if (todo) {
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
    todo.todo = todoContent;
    await todo.save({ timestamps: true });
    isVerbose
      ? res.json({
          _id: todo._id,
          todo: todo.todo,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        })
      : res.json({ todo: todo.todo, _id: todo._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};

exports.deleteTodo = async (req, res, next) => {
  /**
   * Deletes a todo
   */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed. Entered Incorrect Value");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  try {
    const todoId = req.params.id;
    const userId = req.userId;
    const todo = await Todo.findById({ _id: todoId });
    if (todo) {
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
    await Todo.deleteOne({ _id: todoId });
    const user = await User.findById({ _id: userId });
    user.todos.pull(todo._id);
    await user.save({ timestamps: true });
    res.status(200).json({ message: "Successfully Deleted Todo" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode === 500;
    }
    next(error);
  }
};
