const Joi = require('joi');

// 使用 string 而非 date，避免 Joi convert:true 将字符串转为 Date 对象
const dateField = (required = false) => {
  const base = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);
  return required ? base.required() : base.optional();
};

const dateRangeSchema = {
  startDate: dateField(),
  endDate: dateField(),
};

exports.pomodoroSummarySchema = Joi.object(dateRangeSchema).unknown(false);
exports.pomodoroDailySchema = Joi.object({
  startDate: dateField(true),
  endDate: dateField(true),
}).unknown(false);

exports.pomodoroTagsSchema = Joi.object(dateRangeSchema).unknown(false);
exports.pomodoroTrendsSchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'year').default('week'),
}).unknown(false);

exports.taskSummarySchema = Joi.object(dateRangeSchema).unknown(false);
exports.taskCompletionSchema = Joi.object({
  period: Joi.string().valid('week', 'month').default('week'),
}).unknown(false);