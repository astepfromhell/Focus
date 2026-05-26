import { get } from './client'

/**
 * 统计数据 API
 */

/**
 * 获取番茄钟统计总览
 * @param {string} [startDate] - 开始日期 (YYYY-MM-DD)
 * @param {string} [endDate] - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: {totalSessions: number, completedSessions: number, totalFocusMinutes: number, completionRate: number, topTags: Array, dailyAverage: number, currentStreak: number}, message: string}>}
 */
export const getPomodoroSummary = (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return get('statistics/pomodoro/summary', params)
}

/**
 * 获取每日番茄钟统计
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: {items: Array<{date: string, totalSessions: number, completedSessions: number, totalMinutes: number}>}, message: string}>}
 */
export const getPomodoroDaily = (startDate, endDate) => {
    return get('statistics/pomodoro/daily', { startDate, endDate })
}

/**
 * 获取标签统计
 * @param {string} [startDate] - 开始日期 (YYYY-MM-DD)
 * @param {string} [endDate] - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: Array<{tag: string, count: number, minutes: number}>, message: string}>}
 */
export const getPomodoroTags = (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return get('statistics/pomodoro/tags', params)
}

/**
 * 获取趋势分析
 * @param {string} period - 时间周期 (week/month/year)
 * @returns {Promise<{success: boolean, data: Array<{date: string, totalSessions: number, completedSessions: number, totalMinutes: number}>, message: string}>}
 */
export const getPomodoroTrends = (period) => {
    return get('statistics/pomodoro/trends', { period })
}

/**
 * 获取任务统计总览
 * @param {string} [startDate] - 开始日期 (YYYY-MM-DD)
 * @param {string} [endDate] - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: {totalTasks: number, completedTasks: number, inProgressTasks: number, pendingTasks: number, overdueTasks: number, completionRate: number, priorityBreakdown: Array, statusBreakdown: Array}, message: string}>}
 */
export const getTaskSummary = (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return get('statistics/tasks/summary', params)
}

/**
 * 获取任务完成率趋势
 * @param {string} period - 时间周期 (week/month)
 * @returns {Promise<{success: boolean, data: Array<{period: string, completedTasks: number, totalTasks: number, completionRate: number}>, message: string}>}
 */
export const getTaskCompletion = (period) => {
    return get('statistics/tasks/completion', { period })
}