const response = require('../utils/response.util');
const statisticsService = require('../services/statistics.service');

const parseDateFilters = (query) => ({
  startDate: query.startDate ? String(query.startDate).slice(0, 10) : undefined,
  endDate: query.endDate ? String(query.endDate).slice(0, 10) : undefined,
});

exports.getPomodoroSummary = async (req, res, next) => {
  try {
    const data = await statisticsService.getPomodoroSummary(req.userId, parseDateFilters(req.query));
    return response.success(res, data, '番茄钟总览');
  } catch (err) {
    next(err);
  }
};

exports.getPomodoroDaily = async (req, res, next) => {
  try {
    const data = await statisticsService.getPomodoroDaily(req.userId, parseDateFilters(req.query));
    return response.success(res, data, '每日统计');
  } catch (err) {
    next(err);
  }
};

exports.getPomodoroTags = async (req, res, next) => {
  try {
    const data = await statisticsService.getPomodoroTags(req.userId, parseDateFilters(req.query));
    return response.success(res, data, '标签统计');
  } catch (err) {
    next(err);
  }
};

exports.getPomodoroTrends = async (req, res, next) => {
  try {
    const { period } = req.query;
    const data = await statisticsService.getPomodoroTrends(req.userId, { period });
    return response.success(res, data, '趋势分析');
  } catch (err) {
    next(err);
  }
};

exports.getTaskSummary = async (req, res, next) => {
  try {
    const data = await statisticsService.getTaskSummary(req.userId, parseDateFilters(req.query));
    return response.success(res, data, '任务总览');
  } catch (err) {
    next(err);
  }
};

exports.getTaskCompletion = async (req, res, next) => {
  try {
    const { period } = req.query;
    const data = await statisticsService.getTaskCompletion(req.userId, { period });
    return response.success(res, data, '完成率分析');
  } catch (err) {
    next(err);
  }
};