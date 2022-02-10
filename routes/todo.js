const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();
const todoController = require("../controllers/todo");
const isAuth = require("../middleware/isAuth");

/* 
HTTP GET Request
Endpoint /todos
Return All Todos for a user
*/

router.get("/", isAuth, todoController.getTodos);

/* 
HTTP GET Request
Endpoint /todo/:id
Return Single Todo for a user
*/

router.get("/:id", isAuth, [param("id").not().isEmpty().trim().isMongoId().withMessage("Invalid ID, must be a string of 12 bytes or a string of 24 hex characters")], todoController.getTodo);

/* 
HTTP PATCH Request
Endpoint /todo/:id
Modify an existing Todo and return Todo for the user
*/

router.patch("/:id", isAuth, [param("id").not().isEmpty().trim().isMongoId().withMessage("Invalid ID, must be a string of 12 bytes or a string of 24 hex characters"), body("todo").not().isEmpty().isLength({ min: 5 }).withMessage("Todo must be minimum 5 characters long")], todoController.editTodo);

/* 
HTTP POST Request
Endpoint /todo
Create a new Todo and return Todo for the user
*/

router.post("/", isAuth, [body("todo").not().isEmpty().isLength({ min: 5 }).withMessage("Todo must be minimum 5 characters long")], todoController.createTodo);

/* 
HTTP DELETE Request
Endpoint /todo/:id
Deletes an existing Todo
*/

router.delete("/:id", isAuth, [param("id").not().isEmpty().trim().isMongoId().withMessage("Invalid ID, must be a string of 12 bytes or a string of 24 hex characters")], todoController.deleteTodo);

module.exports = router;
