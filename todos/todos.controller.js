const Todo = require('./todos.model')
const jwt = require('jsonwebtoken');
const Core = require("../lib/core.js")

exports.createTodo = async function (req, res) {
	if (req.body && req.body.name && req.body.address && req.body.city && req.body.country) {
		const todoData = {
			name: req.body.name,
			address: req.body.address,
			city: req.body.city,
			country: req.body.country,
			userId: req.decoded.userId
		}
		var addTodo = new Todo(todoData)

		addTodo.save((err, result) => {
			if (err) res.send(err)
			else return res.send(result)
		})
	} else return res.status(400).send({ message: 'Invalid details' })
}

exports.updateTodo = async function (req, res) {
	try {
		if (!req.params.todoId) return res.status(400).send({ message: 'Invalid details' })

		const todo = await Todo.findOne({ _id: req.params.todoId })
		if (!todo || (todo && !todo._id)) return res.status(404).send({ message: 'Todo not found' })
		if (todo && todo.userId && (todo.userId != req.decoded.userId)) return res.status(401).send({ message: 'Unauthorized user' })

		const todoData = {}
		if (req.body.name) todoData['name'] = req.body.name
		if (req.body.address) todoData['address'] = req.body.address
		if (req.body.city) todoData['city'] = req.body.city
		if (req.body.country) todoData['country'] = req.body.country

		const updated = await Todo.updateOne({ _id: req.params.todoId }, {
			$set: todoData
		})

		if (updated) return res.send(await Todo.findOne({ _id: req.params.todoId }))
		else return res.status(400).send({ message: 'Invalid details' })
	} catch(err) { return res.status(502).send(err.message) }
}

exports.getTodoList = async function (req, res) {
	try { return res.send(await Todo.find({ userId: req.decoded.userId })) } 
	catch(err) { return res.status(502).send(err.message) }
}

exports.deleteTodo = async function (req, res) {
	try {
		if (!req.params.todoId) return res.status(400).send({ message: 'Invalid details' })
		const todo = await Todo.findOne({ _id: req.params.todoId })
		if (!todo || (todo && !todo._id)) return res.status(404).send({ message: 'Todo not found' })
		if (todo && todo.userId && (todo.userId != req.decoded.userId)) return res.status(401).send({ message: 'Unauthorized user' })	

		await Todo.deleteOne({ _id: req.params.todoId })
		return res.send({ success: true, message: 'Todo removed successfuly' })
	} catch(err) { return res.status(502).send(err.message) }
}