const jwt = require('jsonwebtoken');
require('dotenv').config();
const payload = {
  deviceId: 'Raspberry Pi Web Client',
};

const token = jwt.sign(payload, process.env.JWTSECRET, {
  expiresIn: '60d', // token valid for 60 days
});

console.log("token:", token);