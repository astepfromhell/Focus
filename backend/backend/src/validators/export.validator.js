const Joi = require('joi');

const downloadFlag = Joi.string().valid('true', 'false').default('false');

exports.pomodoroExportSchema = Joi.object({
  format: Joi.string().valid('json', 'csv').default('json'),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  download: downloadFlag,
}).unknown(false);

exports.simpleExportSchema = Joi.object({
  format: Joi.string().valid('json', 'csv').default('json'),
  download: downloadFlag,
}).unknown(false);

exports.allExportSchema = Joi.object({
  format: Joi.string().valid('json', 'zip').default('json'),
  download: downloadFlag,
}).unknown(false);
