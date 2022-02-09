const express = require("express");
const router = express.Router();
const User = require("../models/user");
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

module.exports = router;
