const Joi = require('joi');
const { STATUS_VALUES } = require('../models/PomodoroSession');

const statusEnum = Joi.string().valid(...STATUS_VALUES);

const baseSessionFields = {
  plannedDuration: Joi.number().integer().min(1).max(240),
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso().allow(null),
  actualDuration: Joi.number().integer().min(0).max(600),
  tag: Joi.string().max(64).allow(null, ''),
  notes: Joi.string().max(500).allow('', null),
  status: statusEnum,
};

exports.createSessionSchema = Joi.object({
  plannedDuration: baseSessionFields.plannedDuration.required(),
  startTime: baseSessionFields.startTime,
  tag: baseSessionFields.tag,
  notes: baseSessionFields.notes,
});

exports.updateSessionSchema = Joi.object({
  endTime: baseSessionFields.endTime,
  actualDuration: baseSessionFields.actualDuration,
  status: baseSessionFields.status,
  notes: baseSessionFields.notes,
  tag: baseSessionFields.tag,
  plannedDuration: baseSessionFields.plannedDuration,
}).min(1);

exports.listSessionSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  startDate: Joi.date().iso().raw().optional(),
  endDate: Joi.date().iso().raw().optional(),
  tag: Joi.string().max(64),
  status: statusEnum,
}).unknown(false);
