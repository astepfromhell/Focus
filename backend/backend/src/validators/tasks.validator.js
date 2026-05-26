const Joi = require('joi');
const { STATUS_VALUES, TYPE_VALUES, PRIORITY_VALUES } = require('../models/Task');

const tagsSchema = Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().max(50)).max(20),
    Joi.string().allow('', null)
);

const baseTaskFields = {
    title: Joi.string().max(255),
    description: Joi.string().allow('', null),
    type: Joi.string().valid(...TYPE_VALUES),

    // ✅ 同时支持驼峰和下划线命名
    startDate: Joi.date().iso().allow(null),
    start_date: Joi.date().iso().allow(null),  // ← 新增

    startTime: Joi.string()
        .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
        .allow(null),
    start_time: Joi.string()  // ← 新增
        .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
        .allow(null),

    endDate: Joi.date().iso().allow(null),
    end_date: Joi.date().iso().allow(null),  // ← 新增

    dueTime: Joi.string()
        .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
        .allow(null),
    due_time: Joi.string()  // ← 新增
        .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
        .allow(null),

    priority: Joi.string().valid(...PRIORITY_VALUES),
    status: Joi.string().valid(...STATUS_VALUES),
    tags: tagsSchema,

    remindAt: Joi.date().iso().allow(null),
    remind_at: Joi.date().iso().allow(null),  // ← 新增

    sortOrder: Joi.number().integer().min(0),
    sort_order: Joi.number().integer().min(0),  // ← 新增

    reminder: Joi.boolean(),  // ← 新增，前端发送的字段
};

exports.createTaskSchema = Joi.object({
    title: baseTaskFields.title.required(),
    description: baseTaskFields.description,
    type: baseTaskFields.type.default('short'),

    // ✅ 驼峰命名
    startDate: baseTaskFields.startDate,
    startTime: baseTaskFields.startTime,
    endDate: baseTaskFields.endDate,
    dueTime: baseTaskFields.dueTime,

    // ✅ 下划线命名
    start_date: baseTaskFields.start_date,
    start_time: baseTaskFields.start_time,
    end_date: baseTaskFields.end_date,
    due_time: baseTaskFields.due_time,

    priority: baseTaskFields.priority.default('medium'),
    status: baseTaskFields.status.default('pending'),
    tags: baseTaskFields.tags,

    remindAt: baseTaskFields.remindAt,
    remind_at: baseTaskFields.remind_at,

    sortOrder: baseTaskFields.sortOrder,
    sort_order: baseTaskFields.sort_order,

    reminder: baseTaskFields.reminder,  // ← 新增
}).unknown(false);  // ✅ 改为 false，只允许定义的字段

exports.updateTaskSchema = Joi.object({
    title: baseTaskFields.title,
    description: baseTaskFields.description,
    type: baseTaskFields.type,

    // ✅ 驼峰命名
    startDate: baseTaskFields.startDate,
    startTime: baseTaskFields.startTime,
    endDate: baseTaskFields.endDate,
    dueTime: baseTaskFields.dueTime,

    // ✅ 下划线命名
    start_date: baseTaskFields.start_date,
    start_time: baseTaskFields.start_time,
    end_date: baseTaskFields.end_date,
    due_time: baseTaskFields.due_time,

    priority: baseTaskFields.priority,
    status: baseTaskFields.status,
    tags: baseTaskFields.tags,

    remindAt: baseTaskFields.remindAt,
    remind_at: baseTaskFields.remind_at,

    sortOrder: baseTaskFields.sortOrder,
    sort_order: baseTaskFields.sort_order,

    parentTaskId: Joi.number().integer().min(1).allow(null),
    parent_task_id: Joi.number().integer().min(1).allow(null),  // ← 新增

    reminder: baseTaskFields.reminder,  // ← 新增
}).min(1);

exports.listTasksSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: baseTaskFields.type,
    status: baseTaskFields.status,
    priority: baseTaskFields.priority,

    startDate: Joi.date().iso().raw().optional(),
    start_date: Joi.date().iso().raw().optional(),  // ← 新增

    endDate: Joi.date().iso().raw().optional(),
    end_date: Joi.date().iso().raw().optional(),  // ← 新增
}).unknown(false);

exports.reorderTaskSchema = Joi.object({
    sortOrder: Joi.number().integer().min(0).required(),
    sort_order: Joi.number().integer().min(0),  // ← 新增
});

exports.calendarSchema = Joi.object({
    startDate: Joi.date().iso(),
    start_date: Joi.date().iso(),
    endDate: Joi.date().iso(),
    end_date: Joi.date().iso(),
})
.or('startDate', 'start_date')
.or('endDate', 'end_date');

exports.createSubtaskSchema = Joi.object({
    title: baseTaskFields.title.required(),
    description: baseTaskFields.description,
    type: baseTaskFields.type.default('short'),

    // ✅ 驼峰命名
    startDate: baseTaskFields.startDate,
    startTime: baseTaskFields.startTime,
    endDate: baseTaskFields.endDate,
    dueTime: baseTaskFields.dueTime,

    // ✅ 下划线命名
    start_date: baseTaskFields.start_date,
    start_time: baseTaskFields.start_time,
    end_date: baseTaskFields.end_date,
    due_time: baseTaskFields.due_time,

    priority: baseTaskFields.priority.default('medium'),
    status: baseTaskFields.status.default('pending'),
    tags: baseTaskFields.tags,

    remindAt: baseTaskFields.remindAt,
    remind_at: baseTaskFields.remind_at,

    sortOrder: baseTaskFields.sortOrder,
    sort_order: baseTaskFields.sort_order,

    reminder: baseTaskFields.reminder,  // ← 新增
});