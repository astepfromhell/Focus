import { get, post, put, del } from './client'

/**
 * 任务 API
 */

/**
 * 获取任务列表
 * @param {Object} params - 查询参数
 * @param {string} [params.type] - 任务类型 (short/long)
 * @param {string} [params.status] - 状态 (pending/in_progress/completed/cancelled)
 * @param {string} [params.startDate] - 开始日期 (YYYY-MM-DD)
 * @param {string} [params.endDate] - 结束日期 (YYYY-MM-DD)
 * @param {string} [params.priority] - 优先级 (low/medium/high)
 * @param {number} [params.page] - 页码
 * @param {number} [params.limit] - 每页数量
 * @returns {Promise<{success: boolean, data: {items: Array, pagination: Object}, message: string}>}
 */
export const getTasks = (params = {}) => {
    return get('tasks', params)
}

/**
 * 获取今日任务
 * @returns {Promise<{success: boolean, data: {items: Array}, message: string}>}
 */
export const getTodayTasks = () => {
    return get('tasks/today')
}

/**
 * 获取日历任务（按日期分组）
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: {dates: Array<{date: string, shortTasks: Array, longTasks: Array}>}, message: string}>}
 */
export const getCalendarTasks = (startDate, endDate) => {
    return get('tasks/calendar', { start_date: startDate, end_date: endDate })
}

/**
 * 获取单个任务详情
 * @param {number} id - 任务ID
 * @returns {Promise<{success: boolean, data: {task: Object}, message: string}>}
 */
export const getTask = (id) => {
    return get(`tasks/${id}`)
}

/**
 * 创建任务
 * @param {Object} data - 任务数据
 * @param {string} data.title - 标题
 * @param {string} [data.description] - 描述
 * @param {string} data.type - 类型 (short/long)
 * @param {string} [data.priority] - 优先级 (low/medium/high)
 * @param {string} [data.status] - 状态
 * @param {boolean} [data.reminder] - 是否提醒
 * @param {string} [data.tags] - 标签
 * @param {string} [data.startDate] - 开始日期 (short任务用)
 * @param {string} [data.endDate] - 结束日期 (long任务用)
 * @param {string} [data.startTime] - 开始时间 (HH:mm:ss)
 * @param {string} [data.dueTime] - 截止时间 (HH:mm:ss)
 * @returns {Promise<{success: boolean, data: {task: Object}, message: string}>}
 */
export const createTask = (data) => {
    return post('tasks', data)
}

/**
 * 更新任务
 * @param {number} id - 任务ID
 * @param {Object} data - 更新的数据
 * @returns {Promise<{success: boolean, data: {task: Object}, message: string}>}
 */
export const updateTask = (id, data) => {
    return put(`tasks/${id}`, data)
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteTask = (id) => {
    return del(`tasks/${id}`)
}

/**
 * 完成任务
 * @param {number} id - 任务ID
 * @returns {Promise<{success: boolean, data: {task: Object}, message: string}>}
 */
export const completeTask = (id) => {
    return put(`tasks/${id}/complete`)
}