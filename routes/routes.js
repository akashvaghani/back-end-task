var express = require('express')
var router = express.Router()
var middleware = require('../middleware')

var user = require('../users/users.controller')
router.post('/authorization', user.authorization)
router.post('/createUser', user.createUser)
router.post('/updateUser', middleware.checkToken, user.updateUser)
router.get('/getUserDetails', middleware.checkToken, user.getUserDetails)

var todo = require('../todos/todos.controller')
router.post('/createTodo', middleware.checkToken, todo.createTodo)
router.post('/updateTodo', middleware.checkToken, todo.updateTodo)
router.post('/getTodoList', middleware.checkToken, todo.getTodoList)
router.delete('/deleteTodo/:todoId', middleware.checkToken, todo.deleteTodo)

module.exports = router;
