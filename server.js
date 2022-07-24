require('dotenv').config()

var express = require('express');
var cors = require('cors');
var morgan = require('morgan');
let jwt = require('jsonwebtoken');
let config = require('./config');
var router = express.Router();

var app = express();
var port = 4000
var bodyParser = require('body-parser');

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// configure app to handle CORS requests
app.use(cors());

var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
// mongoose.connect("mongodb://localhost:27017/practicalDB");

app.use(function (req, res, next) {
	next();
});

app.use(require('./routes/routes'));

app.listen(config.PORT, config.HOST, () => {
    console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
})

module.exports = app;
