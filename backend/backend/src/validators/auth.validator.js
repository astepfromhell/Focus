const Joi = require('joi');

const email = Joi.string().email().max(255).required();
const password = Joi.string().min(6).max(128).required();

exports.registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  email,
  password,
});

exports.loginSchema = Joi.object({
  email,
  password,
});

exports.logoutSchema = Joi.object({
  refreshToken: Joi.string().min(10).required(),
});

exports.refreshSchema = Joi.object({
  refreshToken: Joi.string().min(10).required(),
});

exports.forgotPasswordSchema = Joi.object({
  email,
});

exports.resetPasswordSchema = Joi.object({
  token: Joi.string().min(10).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

exports.verifyEmailSchema = Joi.object({
  token: Joi.string().min(10).required(),
});
