const mongoose = require("mongoose");
const Todo = require("../models/todo");
const User = require("../models/user");

exports.getTodo = async (req, res, next) => {
  const userId = req.user._id;

  const todoList = await Todo.find({ userId: userId }, { userId: 0, createdAt: 0, updatedAt: 0, __v: 0 });

  res.send([...todoList]);
};

exports.getATodo = (req, res, next) => {
  const { id } = req.params;
  res.send({ todo: `Congrats you got your todo with Id:${id}` });
};

exports.createTodo = (req, res, next) => {
  const userId = req.user._id;
  const todoContent = req.body.todo;
  let todoId;

  const todo = new Todo({
    todo: todoContent,
    userId: userId,
  });

  todo
    .save()
    .then((todo) => {
      todoId = todo._id;
      return User.findById(todo.userId);
    })
    .then((user, todo) => {
      user.todo.push(todoId);
      return user.save();
    })
    .then(() => {
      res.send({ todo: todoContent, id: todoId });
    })
    .catch((err) => {
      console.log(err);
    });
};
