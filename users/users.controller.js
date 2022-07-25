const User = require('./users.model')
const jwt = require('jsonwebtoken');
const Core = require("../lib/core.js")
const _ = require('underscore')

exports.authorization = async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (email && password) {
    try {
      const user = await User.findOne({ 'email': { $regex: new RegExp('' + email, 'i') } }, { _id: 1, password: 1 })
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      var validPassword = Core.comparePassword(password, user.password);
      if (!validPassword) res.status(403).json({ message: 'Authencation failed. Wrong password' })
      else {
        const token = jwt.sign({ userId: user._id },
          process.env.SECRET,
          { expiresIn: '24h' } // expires in 24 hours
        );
        // return the JWT token for the future API calls
        return res.json({
          success: true,
          message: 'Authentication successful!',
          token: token
        });
      }
    } catch(err) { res.status(502).json({ message: err.message }) }
  } else {
    res.status(400).json({
      success: false,
      message: 'Authentication failed! Please check the request'
    });
  }
}

exports.createUser = async function (req, res) {
  const params = req.body
  if (params && params.firstName && params.email && params.password) {
    const email = req.body.email.toLowerCase()
    if (Core.validateEmail(email)) {
      try {
        const userWithEmail = await User.findOne({ 'email': { $regex: new RegExp('' + params.email, 'i') } }, { _id: 1 })
        if (userWithEmail) {
          return res.status(409).send({ message: 'Email already exists' })
        }

        const userData = {
          firstName: params.firstName,
          lastName: params.lastName || '',
          email: params.email,
          password: params.password,
          gender: params.gender || ''
        }
        var addUser = new User(userData)

        addUser.save((err, result) => {
          if (err) res.send(err)
          else return res.send(_.pick(result, ['_id', 'email', 'firstName', 'lastName', 'gender']))
        })
      } catch(err) { res.status(502).json({ message: err.message }) }
    } else return res.status(400).send({ message: 'Please enter valid email' })
  } else return res.status(400).send({ message: 'Invalid details' })
}

exports.updateUser = async function (req, res) {
  const params = req.body
  try {
    if (params && params.email) {
      if (Core.validateEmail(params.email)) {
        const userWithEmail = await  User.findOne({ _id: { $ne: req.decoded.userId }, 'email': { $regex: new RegExp('' + params.email, 'i') } }, { _id: 1 })
        if (userWithEmail) {
          return res.status(409).send({ message: 'Email already exists' })
        }
      } else return res.status(400).send({ message: 'Invalid details' })
    }

    const userData = {}
    if (params.email) userData['email'] = params.email
    if (params.firstName) userData['firstName'] = params.firstName
    if (params.lastName) userData['lastName'] = params.lastName
    if (params.gender) userData['gender'] = params.gender

    const updated = await User.updateOne({ _id: req.decoded.userId }, {
      $set: userData
    })

    if (updated) return res.send(await User.findOne({ _id: req.decoded.userId }, { password: 0 }))
    else return res.status(400).send({ message: 'Invalid details' })
  } catch(err) { res.status(502).json({ message: err.message }) }
}

exports.getUserDetails = async function (req, res) {
  try { res.send(await User.findOne({ _id: req.decoded.userId }, { password: 0 })) } 
  catch(err) { res.status(502).json({ message: err.message }) }
}

exports.changePassword = async function (req, res) {
  const params = req.body
  if (params.oldPassword && params.newPassword) {
    try {
      var isValidPassword = Core.isValidPassword(params.newPassword)
      if (isValidPassword) {
        const userObj = await User.findOne({ _id: req.decoded.userId })
        if(userObj && userObj._id) {
          var validPassword = Core.comparePassword(params.oldPassword, userObj.password);
          if (!validPassword) return res.status(400).send({ message: 'Incorrect current password' })
          else {
            var password = Core.encryptPassword(params.newPassword)
            try {
              await User.updateOne({ _id: userObj._id }, { $set: { password } })
              return res.status(200).send({ message: 'Password changed successfully' })
            } catch (err) { return res.status(502).send({ message: err.message }) }
          }
        } else return res.status(400).send({ message: 'Invalid details' })
      } else return res.status(400).send({ message: 'Password should be contains at least 1 number 1 character and 1 alphabet' })
    } catch (err) { return res.status(502).send({ message: err.message }) }  
  } else return res.status(400).send({ message: 'Invalid details' })
}