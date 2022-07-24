const Todo = require('./todos.model')
const jwt = require('jsonwebtoken');
const Core = require("../lib/core.js")

exports.createTodo = async function (req, res) {
	console.log("user", req.body)
	const params = req.body
	if (params && params.name && params.address && params.city && params.country) {
		const todoData = {
			name: params.name,
			address: params.address,
			city: params.city,
			country: params.country,
			userId: req.decoded.userId
		}
		var addTodo = new Todo(todoData)

		addTodo.save((err, result) => {
			if (err) res.send(err)
			else {
				console.log("saved data", result)
				return res.send(result)
			}
		})
	} else {
		return res.status(400).send({ message: 'Invalid details' })
	}
}

exports.updateTodo = async function (req, res) {
	console.log("user", req.body)
	try {
		const params = req.body
		if (!params.todoId) return res.status(400).send({ message: 'Invalid details' })

		const todo = await Todo.findOne({ _id: params.todoId })
		if (!todo || (todo && !todo._id)) return res.status(404).send({ message: 'Todo not found' })
		if (todo && todo.userId && (todo.userId != req.decoded.userId)) return res.status(401).send({ message: 'Unauthorized user' })

		const todoData = {}
		if (params.name) todoData['name'] = params.name
		if (params.address) todoData['address'] = params.address
		if (params.city) todoData['city'] = params.city
		if (params.country) todoData['country'] = params.country

		console.log('outer')
		const updated = await Todo.updateOne({ _id: params.todoId }, {
			$set: todoData
		})
		console.log('inner')

		if (updated) {
			return res.send(await Todo.findOne({ _id: params.todoId }))
		} else {
			return res.status(400).send({ message: 'Invalid details' })
		}
	} catch(err) {
		return res.status(502).send(err)
	}
}

exports.getTodoList = async function (req, res) {
	console.log("user", req.body)
	try {
		return res.send(await Todo.find({ userId: req.decoded.userId }))
	} catch(err) {
		return res.status(502).send(err)
	}
}

exports.deleteTodo = async function (req, res) {
	console.log("todoId", req.params.todoId)
	try {
		if (!req.params.todoId) return res.status(400).send({ message: 'Invalid details' })
		const todo = await Todo.findOne({ _id: req.params.todoId })
		if (!todo || (todo && !todo._id)) return res.status(404).send({ message: 'Todo not found' })
		if (todo && todo.userId && (todo.userId != req.decoded.userId)) return res.status(401).send({ message: 'Unauthorized user' })	

		await Todo.deleteOne({ _id: req.params.todoId })
		return res.send({ success: true, message: 'Todo removed successfuly' })
	} catch(err) {
		return res.status(502).send(err)
	}
}