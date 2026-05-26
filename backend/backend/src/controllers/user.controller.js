const response = require('../utils/response.util');
const userService = require('../services/user.service');

exports.me = async (req, res, next) => {
  try {
    const data = await userService.getProfile(req.userId);
    return response.success(res, data, '获取当前用户');
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    return response.success(res, { user }, '用户信息已更新');
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
    return response.success(res, { changed: true }, '密码已修改');
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.userId, req.body.password);
    return response.success(res, { deleted: true }, '账户已删除');
  } catch (err) {
    next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    const user = await userService.uploadAvatar(req.userId, req.file);
    return response.success(res, { user }, '头像已更新');
  } catch (err) {
    next(err);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await userService.getSettings(req.userId);
    return response.success(res, { settings }, '用户设置');
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await userService.updateSettings(req.userId, req.body);
    return response.success(res, { settings }, '设置已更新');
  } catch (err) {
    next(err);
  }
};

exports.updateThemeSettings = async (req, res, next) => {
  try {
    const settings = await userService.updateSettings(req.userId, req.body);
    return response.success(res, { settings }, '主题已更新');
  } catch (err) {
    next(err);
  }
};

exports.updatePomodoroSettings = async (req, res, next) => {
  try {
    const settings = await userService.updateSettings(req.userId, req.body);
    return response.success(res, { settings }, '番茄钟设置已更新');
  } catch (err) {
    next(err);
  }
};

exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const settings = await userService.updateSettings(req.userId, req.body);
    return response.success(res, { settings }, '通知设置已更新');
  } catch (err) {
    next(err);
  }
};

exports.resetSettings = async (req, res, next) => {
  try {
    const settings = await userService.resetSettings(req.userId);
    return response.success(res, { settings }, '设置已重置');
  } catch (err) {
    next(err);
  }
};
