import { get, put } from './client'

/**
 * 用户 API
 */

/**
 * 获取当前用户信息
 * @returns {Promise<{success: boolean, data: {user: {id: number, username: string, email: string, avatarUrl: string|null, createdAt: string, lastLoginAt: string}, settings: Object}, message: string}>}
 */
export const getCurrentUser = () => {
    return get('users/me')
}

/**
 * 获取用户设置
 * @returns {Promise<{success: boolean, data: {settings: Object}, message: string}>}
 */
export const getSettings = () => {
    return get('users/settings')
}

/**
 * 更新番茄钟设置
 * @param {Object} data - 设置数据
 * @param {number} data.pomodoroDuration - 专注时长（分钟）
 * @param {number} data.shortBreak - 短休息时长（分钟）
 * @param {number} data.longBreak - 长休息时长（分钟）
 * @returns {Promise<{success: boolean, data: {settings: Object}, message: string}>}
 */
export const updatePomodoroSettings = (data) => {
    return put('users/settings/pomodoro', data)
}

/**
 * 更新主题设置
 * @param {Object} data - 设置数据
 * @param {string} data.theme - 主题 (light/dark)
 * @param {string} [data.primaryColor] - 主色调
 * @param {string} [data.backgroundImageUrl] - 背景图片URL
 * @returns {Promise<{success: boolean, data: {settings: Object}, message: string}>}
 */
export const updateThemeSettings = (data) => {
    return put('users/settings/theme', data)
}

/**
 * 更新通知设置
 * @param {Object} data - 设置数据
 * @param {boolean} data.enableNotifications - 是否启用通知
 * @param {boolean} data.notificationSound - 是否启用通知声音
 * @returns {Promise<{success: boolean, data: {settings: Object}, message: string}>}
 */
export const updateNotificationSettings = (data) => {
    return put('users/settings/notifications', data)
}

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<{success: boolean, message: string, data?: {changed: boolean}}>}
 */
export const changePassword = (oldPassword, newPassword) => {
    return put('users/me/password', { oldPassword, newPassword })
}