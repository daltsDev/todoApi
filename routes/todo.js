const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();
const todoController = require("../controllers/todo");

/* 
HTTP GET Request
Endpoint /todos
Return All Todos for a user
*/

router.get("/", todoController.getTodos);

/* 
HTTP GET Request
Endpoint /todo/:id
Return Single Todo for a user
*/

router.get("/:id", param("id").not().isEmpty().trim().isMongoId().withMessage("Invalid ID, must be a string of 12 bytes or a string of 24 hex characters"), todoController.getTodo);

/* 
HTTP PATCH Request
Endpoint /todo/:id
Modify an existing Todo and return Todo for the user
*/

router.patch("/:id", todoController.editTodo);
/* 
HTTP POST Request
Endpoint /todo
Create a new Todo and return Todo for the user
*/

router.post("/", todoController.createTodo);

/* 
HTTP DELETE Request
Endpoint /todo/:id
Deletes an existing Todo
*/

router.delete("/:id", todoController.deleteTodo);

module.exports = router;
