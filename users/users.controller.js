const User = require('./users.model')
const jwt = require('jsonwebtoken');
const Core = require("../lib/core.js")
const _ = require('underscore')

exports.authorization = async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (email && password) {
    try {
      const user = await User.findOne({ 'email': { $regex: new RegExp('' + email, 'i') } })
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
  if (req.body && req.body.firstName && req.body.email && req.body.password) {
    const email = req.body.email.toLowerCase()
    if (Core.validateEmail(email)) {
      try {
        const userWithEmail = await User.findOne({ 'email': { $regex: new RegExp('' + params.email, 'i') } })
        if (userWithEmail) {
          return res.status(409).send({ message: 'Email already exists' })
        }

        const userData = {
          firstName: req.body.firstName,
          lastName: req.body.lastName || '',
          email: req.body.email,
          password: req.body.password,
          gender: req.body.gender || ''
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
  try {
    if (req.body && req.body.email) {
      if (Core.validateEmail(req.body.email)) {
        const userWithEmail = await  User.findOne({ _id: { $ne: req.decoded.userId }, 'email': { $regex: new RegExp('' + req.body.email, 'i') } })
        if (userWithEmail) {
          return res.status(409).send({ message: 'Email already exists' })
        }
      } else return res.status(400).send({ message: 'Invalid details' })
    }

    const userData = {}
    if (req.body.email) userData['email'] = req.body.email
    if (req.body.firstName) userData['firstName'] = req.body.firstName
    if (req.body.lastName) userData['lastName'] = req.body.lastName
    if (req.body.gender) userData['gender'] = req.body.gender

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
  if (req.body.oldPassword && req.body.newPassword) {
    try {
      const userObj = await User.findOne({ _id: req.decoded.userId })
      if(userObj && userObj._id) {
        var validPassword = Core.comparePassword(req.body.oldPassword, userObj.password);
        if (!validPassword) return res.status(400).send({ message: 'Incorrect current password' })
        else {
          var password = Core.encryptPassword(req.body.newPassword)
          try {
            await User.updateOne({ _id: userObj._id }, { $set: { password } })
            return res.status(200).send({ message: 'Password changed successfully' })
          } catch (err) { return res.status(502).send({ message: err.message }) }
        }
      } else return res.status(400).send({ message: 'Invalid details' })
    } catch (err) { return res.status(502).send({ message: err.message }) }  
  } else return res.status(400).send({ message: 'Invalid details' })
}