const response = require('../utils/response.util');
const pomodoroService = require('../services/pomodoro.service');

exports.createSession = async (req, res, next) => {
  try {
    const session = await pomodoroService.createSession(req.userId, req.body);
    return response.success(res, { session }, '会话已创建');
  } catch (err) {
    next(err);
  }
};

exports.listSessions = async (req, res, next) => {
  try {
    const data = await pomodoroService.listSessions(req.userId, req.query);
    return response.success(res, data, '会话列表');
  } catch (err) {
    next(err);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const session = await pomodoroService.getSession(req.userId, req.params.id);
    return response.success(res, { session }, '会话详情');
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await pomodoroService.updateSession(req.userId, req.params.id, req.body);
    return response.success(res, { session }, '会话已更新');
  } catch (err) {
    next(err);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    await pomodoroService.deleteSession(req.userId, req.params.id);
    return response.success(res, { deleted: true }, '会话已删除');
  } catch (err) {
    next(err);
  }
};

exports.interruptSession = async (req, res, next) => {
  try {
    const session = await pomodoroService.interruptSession(req.userId, req.params.id);
    return response.success(res, { session }, '中断已记录');
  } catch (err) {
    next(err);
  }
};

exports.getTags = async (req, res, next) => {
  try {
    const tags = await pomodoroService.getTags(req.userId);
    return response.success(res, { tags }, '标签列表');
  } catch (err) {
    next(err);
  }
};
