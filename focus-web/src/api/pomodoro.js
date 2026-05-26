import { get, post, put } from './client'

/**
 * 番茄钟 API
 */

/**
 * 创建番茄钟会话
 * @param {Object} data - 会话数据
 * @param {number} data.plannedDuration - 计划时长（分钟）
 * @param {string} [data.tag] - 标签
 * @param {string} [data.notes] - 备注
 * @returns {Promise<{success: boolean, data: {session: Object}, message: string}>}
 */
export const createSession = (data) => {
    return post('pomodoro/sessions', data)
}

/**
 * 更新番茄钟会话
 * @param {number} sessionId - 会话ID
 * @param {Object} data - 更新数据
 * @param {string} [data.endTime] - 结束时间 (ISO 8601)
 * @param {number} [data.actualDuration] - 实际时长（分钟）
 * @param {string} [data.status] - 状态 (completed/cancelled)
 * @param {string} [data.notes] - 备注
 * @returns {Promise<{success: boolean, data: {session: Object}, message: string}>}
 */
export const updateSession = (sessionId, data) => {
    return put(`pomodoro/sessions/${sessionId}`, data)
}

/**
 * 获取会话列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.limit] - 每页数量
 * @param {string} [params.startDate] - 开始日期 (YYYY-MM-DD)
 * @param {string} [params.endDate] - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: {sessions: Array, pagination: Object}, message: string}>}
 */
export const getSessions = (params = {}) => {
    return get('pomodoro/sessions', params)
}

/**
 * 获取番茄钟统计总览
 * @param {string} [startDate] - 开始日期 (YYYY-MM-DD)
 * @param {string} [endDate] - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: {totalSessions: number, completedSessions: number, totalFocusMinutes: number, completionRate: number}, message: string}>}
 */
export const getPomodoroSummary = (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return get('statistics/pomodoro/summary', params)
}