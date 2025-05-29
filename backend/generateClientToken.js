const jwt = require('jsonwebtoken');
require('dotenv').config();
const payload = {
  deviceId: 'Raspberry Pi Web Client',
};

const token = jwt.sign(payload, process.env.JWTSECRET, {
  expiresIn: '7d', // token valid for 7 days
});

console.log("token:", token);