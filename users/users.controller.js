const User = require('./users.model')
const jwt = require('jsonwebtoken');
const Core = require("../lib/core.js")
const _ = require('underscore')

exports.authorization = async function (req, res) {
  console.log('SECRET', process.env.SECRET)
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
    } catch(err) {
      console.log('error', err)
      res.status(502).json({ message: err })
    }
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
    const email = params.email.toLowerCase()
    if (Core.validateEmail(email)) {
      try {
        const userWithEmail = await User.findOne({ 'email': { $regex: new RegExp('' + params.email, 'i') } })
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
          else {
            console.log("saved data", result)
            return res.send(_.pick(result, ['_id', 'email', 'firstName', 'lastName', 'gender']))
          }
        })
      } catch(err) {
        res.status(502).json({ message: err })
      }
    } else {
      return res.status(400).send({ message: 'Please enter valid email' })
    }
  } else {
    return res.status(400).send({ message: 'Invalid details' })
  }
}

exports.updateUser = async function (req, res) {
  const params = req.body
  try {
    if (params && params.email) {
      if (Core.validateEmail(params.email)) {
        const userWithEmail = await  User.findOne({ _id: { $ne: req.decoded.userId }, 'email': { $regex: new RegExp('' + params.email, 'i') } })
        if (userWithEmail) {
          return res.status(409).send({ message: 'Email already exists' })
        }
      } else {
        return res.status(400).send({ message: 'Invalid details' })
      }
    }

    const userData = {}
    if (params.email) userData['email'] = params.email
    if (params.firstName) userData['firstName'] = params.firstName
    if (params.lastName) userData['lastName'] = params.lastName
    if (params.gender) userData['gender'] = params.gender

    const updated = await User.updateOne({ _id: req.decoded.userId }, {
      $set: userData
    })

    if (updated) {
      return res.send(await User.findOne({ _id: req.decoded.userId }, { password: 0 }))
    } else {
      return res.status(400).send({ message: 'Invalid details' })
    }
  } catch(err) {
    res.status(502).json({ message: err })
  }
}

exports.getUserDetails = async function (req, res) {
  console.log("user", req.body)
  try {
    res.send(await User.findOne({ _id: req.decoded.userId }, { password: 0 }))
  } catch(err) {
    res.status(502).json({ message: err })
  }
}