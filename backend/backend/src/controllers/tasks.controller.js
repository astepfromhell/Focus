const response = require('../utils/response.util');
const tasksService = require('../services/tasks.service');

exports.createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.userId, req.body);
    return response.success(res, { task }, '任务已创建');
  } catch (err) {
    next(err);
  }
};

exports.listTasks = async (req, res, next) => {
  try {
    const data = await tasksService.listTasks(req.userId, req.query);
    return response.success(res, data, '任务列表');
  } catch (err) {
    next(err);
  }
};

exports.listToday = async (req, res, next) => {
  try {
    const data = await tasksService.listToday(req.userId);
    return response.success(res, data, '今日任务');
  } catch (err) {
    next(err);
  }
};

exports.calendarView = async (req, res, next) => {
  try {
    const data = await tasksService.getCalendarView(req.userId, req.query);
    return response.success(res, data, '日历视图');
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await tasksService.getTask(req.userId, req.params.id);
    return response.success(res, { task }, '任务详情');
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(req.userId, req.params.id, req.body);
    return response.success(res, { task }, '任务已更新');
  } catch (err) {
    next(err);
  }
};

exports.completeTask = async (req, res, next) => {
  try {
    const task = await tasksService.completeTask(req.userId, req.params.id);
    return response.success(res, { task }, '任务已完成');
  } catch (err) {
    next(err);
  }
};

exports.reorderTask = async (req, res, next) => {
  try {
    const task = await tasksService.reorderTask(req.userId, req.params.id, req.body.sortOrder);
    return response.success(res, { task }, '排序已更新');
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await tasksService.deleteTask(req.userId, req.params.id);
    return response.success(res, { deleted: true }, '任务已删除');
  } catch (err) {
    next(err);
  }
};

exports.createSubtask = async (req, res, next) => {
  try {
    const task = await tasksService.createSubtask(req.userId, req.params.id, req.body);
    return response.success(res, { task }, '子任务已创建');
  } catch (err) {
    next(err);
  }
};
