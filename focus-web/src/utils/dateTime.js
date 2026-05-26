import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-cn'

// 配置 dayjs 插件
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.locale('zh-cn')

/**
 * 日期时间工具类
 */

/**
 * 格式化日期 YYYY-MM-DD
 * @param {string|Date|dayjs} date - 日期
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return ''
    return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化日期 YYYY年MM月DD日
 * @param {string|Date|dayjs} date - 日期
 * @returns {string}
 */
export const formatChineseDate = (date) => {
    if (!date) return ''
    return dayjs(date).format('YYYY年MM月DD日')
}

/**
 * 格式化日期 MM月DD日
 * @param {string|Date|dayjs} date - 日期
 * @returns {string}
 */
export const formatShortDate = (date) => {
    if (!date) return ''
    return dayjs(date).format('MM月DD日')
}

/**
 * 格式化时间 HH:mm
 * @param {string|Date|dayjs} time - 时间
 * @returns {string}
 */
export const formatTime = (time) => {
    if (!time) return ''
    return dayjs(time).format('HH:mm')
}

/**
 * 格式化时间 HH:mm:ss
 * @param {string|Date|dayjs} time - 时间
 * @returns {string}
 */
export const formatFullTime = (time) => {
    if (!time) return ''
    return dayjs(time).format('HH:mm:ss')
}

/**
 * 格式化日期时间 YYYY-MM-DD HH:mm
 * @param {string|Date|dayjs} datetime - 日期时间
 * @returns {string}
 */
export const formatDateTime = (datetime) => {
    if (!datetime) return ''
    return dayjs(datetime).format('YYYY-MM-DD HH:mm')
}

/**
 * 格式化相对时间（刚刚、X分钟前、X小时前、昨天、X天前）
 * @param {string|Date|dayjs} timestamp - 时间戳
 * @returns {string}
 */
export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return ''
    const now = dayjs()
    const target = dayjs(timestamp)
    const diffMinutes = now.diff(target, 'minute')
    const diffHours = now.diff(target, 'hour')
    const diffDays = now.diff(target, 'day')

    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return formatDate(timestamp)
}

/**
 * 获取星期几文本
 * @param {string|Date|dayjs} date - 日期
 * @returns {string}
 */
export const getWeekdayText = (date) => {
    if (!date) return ''
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `星期${weekdays[dayjs(date).day()]}`
}

/**
 * 获取完整星期几文本
 * @param {string|Date|dayjs} date - 日期
 * @returns {string}
 */
export const getFullWeekdayText = (date) => {
    if (!date) return ''
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return weekdays[dayjs(date).day()]
}

/**
 * 判断是否是今天
 * @param {string|Date|dayjs} date - 日期
 * @returns {boolean}
 */
export const isToday = (date) => {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否是本周
 * @param {string|Date|dayjs} date - 日期
 * @returns {boolean}
 */
export const isThisWeek = (date) => {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'week')
}

/**
 * 判断是否是本月
 * @param {string|Date|dayjs} date - 日期
 * @returns {boolean}
 */
export const isThisMonth = (date) => {
    if (!date) return false
    return dayjs(date).isSame(dayjs(), 'month')
}

/**
 * 获取距今天数
 * @param {string|Date|dayjs} date - 日期
 * @returns {number}
 */
export const getDaysFromToday = (date) => {
    if (!date) return 0
    return dayjs(date).diff(dayjs(), 'day')
}

/**
 * 获取截止日期描述文本
 * @param {string|Date|dayjs} endDate - 截止日期
 * @returns {string}
 */
export const getDeadlineText = (endDate) => {
    if (!endDate) return ''
    const days = getDaysFromToday(endDate)
    if (days < 0) return '已逾期'
    if (days === 0) return '今天截止'
    if (days === 1) return '明天截止'
    if (days <= 7) return `${days}天后截止`
    return `${days}天后`
}

/**
 * 获取截止状态
 * @param {string|Date|dayjs} endDate - 截止日期
 * @returns {string} NORMAL | SOON | URGENT | OVERDUE
 */
export const getDeadlineStatus = (endDate) => {
    if (!endDate) return 'NORMAL'
    const days = getDaysFromToday(endDate)
    if (days < 0) return 'OVERDUE'
    if (days <= 1) return 'URGENT'
    if (days <= 3) return 'SOON'
    return 'NORMAL'
}

/**
 * 获取月份天数
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @returns {number}
 */
export const getDaysInMonth = (year, month) => {
    return dayjs(`${year}-${month}-01`).daysInMonth()
}

/**
 * 获取月份第一天是星期几
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @returns {number} 0-6 (星期日-星期六)
 */
export const getFirstDayOfMonth = (year, month) => {
    return dayjs(`${year}-${month}-01`).day()
}

/**
 * 格式化秒数为 MM:SS
 * @param {number} seconds - 秒数
 * @returns {string}
 */
export const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化分钟数为可读格式
 * @param {number} minutes - 分钟数
 * @returns {string}
 */
export const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}小时${mins}分钟`
    if (hours > 0) return `${hours}小时`
    return `${mins}分钟`
}

/**
 * 解析 API 日期字符串为 dayjs 对象
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD 或 ISO 格式)
 * @returns {dayjs|null}
 */
export const parseApiDate = (dateStr) => {
    if (!dateStr) return null
    const datePart = dateStr.substring(0, 10)
    return dayjs(datePart)
}

/**
 * 解析 API 时间字符串
 * @param {string} timeStr - 时间字符串 (HH:mm:ss 或 HH:mm)
 * @returns {string} HH:mm
 */
export const parseApiTime = (timeStr) => {
    if (!timeStr) return ''
    return timeStr.substring(0, 5)
}

/**
 * 获取 ISO 时间戳字符串（用于 API 请求）
 * @param {Date|dayjs} date - 日期
 * @returns {string}
 */
export const toISOString = (date) => {
    return dayjs(date).toISOString()
}

/**
 * 获取当前时间戳（毫秒）
 * @returns {number}
 */
export const nowTimestamp = () => {
    return Date.now()
}

export default {
    formatDate,
    formatChineseDate,
    formatShortDate,
    formatTime,
    formatFullTime,
    formatDateTime,
    formatRelativeTime,
    getWeekdayText,
    getFullWeekdayText,
    isToday,
    isThisWeek,
    isThisMonth,
    getDaysFromToday,
    getDeadlineText,
    getDeadlineStatus,
    getDaysInMonth,
    getFirstDayOfMonth,
    formatSeconds,
    formatMinutes,
    parseApiDate,
    parseApiTime,
    toISOString,
    nowTimestamp
}