const Joi = require('joi');

const hexColor = Joi.string().pattern(/^#(?:[0-9a-fA-F]{3}){1,2}$/).message('primaryColor must be a hex color');

exports.updateProfileSchema = Joi.object({
  username: Joi.string().min(2).max(50),
  email: Joi.string().email().max(255),
}).min(1);

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).max(128).required(),
  newPassword: Joi.string().min(6).max(128).disallow(Joi.ref('oldPassword')).required(),
});

exports.deleteAccountSchema = Joi.object({
  password: Joi.string().min(6).max(128).required(),
});

exports.updateSettingsSchema = Joi.object({
  pomodoroDuration: Joi.number().integer().min(1).max(180),
  shortBreak: Joi.number().integer().min(1).max(60),
  longBreak: Joi.number().integer().min(1).max(60),
  autoStartBreak: Joi.boolean(),
  autoStartPomodoro: Joi.boolean(),
  enableNotifications: Joi.boolean(),
  notificationSound: Joi.boolean(),
  soundVolume: Joi.number().integer().min(0).max(100),
  theme: Joi.string().valid('light', 'dark', 'system', 'custom'),
  primaryColor: hexColor,
  backgroundImageUrl: Joi.string().uri().allow(null, ''),
  fontSize: Joi.string().valid('small', 'medium', 'large'),
  language: Joi.string().max(10),
  dataRetentionDays: Joi.number().integer().min(1).max(730),
}).min(1);

exports.updateThemeSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system', 'custom').required(),
  primaryColor: hexColor.required(),
  backgroundImageUrl: Joi.string().uri().allow(null, ''),
});

exports.updatePomodoroSchema = Joi.object({
  pomodoroDuration: Joi.number().integer().min(1).max(180).required(),
  shortBreak: Joi.number().integer().min(1).max(60).required(),
  longBreak: Joi.number().integer().min(1).max(60).required(),
});

exports.updateNotificationSchema = Joi.object({
  enableNotifications: Joi.boolean().required(),
  notificationSound: Joi.boolean().required(),
  soundVolume: Joi.number().integer().min(0).max(100).required(),
});
