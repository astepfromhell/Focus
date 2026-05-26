const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/jwt');

exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
};

exports.generateRefreshToken = (payload = {}) => {
  const jwtid = crypto.randomUUID();
  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn, jwtid });
};

exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtRefreshSecret);
  } catch (err) {
    return null;
  }
};

exports.decode = (token) => jwt.decode(token);
