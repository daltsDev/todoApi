const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo");

/* 
HTTP GET Request
Endpoint /todos
Return All Todos for a user
*/

router.get("/", todoController.getTodo);

/* 
HTTP GET Request
Endpoint /todo/:id
Return Single Todo for a user
*/

router.get("/:id", todoController.getATodo);

/* 
HTTP POST Request
Endpoint /todo
Create a new Todo and return Todo for the user
*/

router.post("/", todoController.createTodo);

/* 
HTTP PATCH Request
Endpoint /todo/:id
Modify an existing Todo and return Todo for the user
*/

router.patch("/:id", todoController.editTodo);

/* 
HTTP DELETE Request
Endpoint /todo/:id
Deletes an existing Todo
*/

router.delete("/:id", todoController.deleteTodo);

module.exports = router;
