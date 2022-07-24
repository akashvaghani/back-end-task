var bcrypt = require('bcrypt-nodejs')

function validateEmail(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/; // eslint-disable-line
	return regex.test(email);
}

const comparePassword = (password, userPassword) => {
	return bcrypt.compareSync(password.toString(), userPassword);
}

const encryptPassword = (password) => {
	return bcrypt.hashSync(password);
}

exports.validateEmail = validateEmail;
exports.comparePassword = comparePassword;
exports.encryptPassword = encryptPassword;