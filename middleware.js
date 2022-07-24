let jwt = require('jsonwebtoken');
const config = require('./config.js');

let checkToken = (req, res, next) => {

  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (!token) return res.status(400).send({ message: 'Token required' })
  console.log("req token", token)
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        console.log('token decoded', decoded)
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(400).send({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = {
  checkToken: checkToken
}
