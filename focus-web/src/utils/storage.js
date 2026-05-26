/**
 * 本地存储工具类
 * 封装 localStorage 操作，支持 JSON 序列化/反序列化
 */

/**
 * 存储数据
 * @param {string} key - 存储键名
 * @param {any} value - 存储值（会自动序列化）
 */
export const setItem = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value)
        localStorage.setItem(key, serializedValue)
    } catch (error) {
        console.error(`存储失败 [${key}]:`, error)
    }
}

/**
 * 读取数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值（当数据不存在时返回）
 * @returns {any}
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const serializedValue = localStorage.getItem(key)
        if (serializedValue === null) return defaultValue
        return JSON.parse(serializedValue)
    } catch (error) {
        console.error(`读取失败 [${key}]:`, error)
        return defaultValue
    }
}

/**
 * 删除数据
 * @param {string} key - 存储键名
 */
export const removeItem = (key) => {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error(`删除失败 [${key}]:`, error)
    }
}

/**
 * 清空所有数据
 */
export const clear = () => {
    try {
        localStorage.clear()
    } catch (error) {
        console.error('清空存储失败:', error)
    }
}

/**
 * 检查键是否存在
 * @param {string} key - 存储键名
 * @returns {boolean}
 */
export const hasItem = (key) => {
    return localStorage.getItem(key) !== null
}

/**
 * 获取所有存储键名
 * @returns {string[]}
 */
export const getKeys = () => {
    return Object.keys(localStorage)
}

/**
 * 获取存储大小（字节）
 * @returns {number}
 */
export const getSize = () => {
    let size = 0
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key)
        size += (key?.length || 0) + (value?.length || 0)
    }
    return size
}

// ==================== 认证相关便捷方法 ====================

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_ID_KEY = 'user_id'
const REMEMBER_ME_KEY = 'remember_me'
const REMEMBERED_EMAIL_KEY = 'remembered_email'

/**
 * 保存认证 Token
 * @param {string} token - 访问令牌
 */
export const saveToken = (token) => {
    setItem(TOKEN_KEY, token)
}

/**
 * 获取认证 Token
 * @returns {string|null}
 */
export const getToken = () => {
    return getItem(TOKEN_KEY, null)
}

/**
 * 删除认证 Token
 */
export const removeToken = () => {
    removeItem(TOKEN_KEY)
}

/**
 * 保存刷新 Token
 * @param {string} refreshToken - 刷新令牌
 */
export const saveRefreshToken = (refreshToken) => {
    setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 获取刷新 Token
 * @returns {string|null}
 */
export const getRefreshToken = () => {
    return getItem(REFRESH_TOKEN_KEY, null)
}

/**
 * 保存用户 ID
 * @param {number} userId - 用户ID
 */
export const saveUserId = (userId) => {
    setItem(USER_ID_KEY, userId)
}

/**
 * 获取用户 ID
 * @returns {number|null}
 */
export const getUserId = () => {
    return getItem(USER_ID_KEY, null)
}

/**
 * 保存记住我状态
 * @param {boolean} rememberMe - 是否记住
 */
export const saveRememberMe = (rememberMe) => {
    setItem(REMEMBER_ME_KEY, rememberMe)
}

/**
 * 获取记住我状态
 * @returns {boolean}
 */
export const getRememberMe = () => {
    return getItem(REMEMBER_ME_KEY, false)
}

/**
 * 保存记住的邮箱
 * @param {string} email - 邮箱
 */
export const saveRememberedEmail = (email) => {
    setItem(REMEMBERED_EMAIL_KEY, email)
}

/**
 * 获取记住的邮箱
 * @returns {string|null}
 */
export const getRememberedEmail = () => {
    return getItem(REMEMBERED_EMAIL_KEY, null)
}

/**
 * 清除所有认证信息
 */
export const clearAuth = () => {
    removeToken()
    removeItem(REFRESH_TOKEN_KEY)
    removeItem(USER_ID_KEY)
    // 注意：不清除 REMEMBER_ME_KEY 和 REMEMBERED_EMAIL_KEY
}

/**
 * 清除所有用户数据（登出时调用）
 */
export const clearUserData = () => {
    clearAuth()
    // 如果不记住登录，也清除记住的邮箱
    if (!getRememberMe()) {
        removeItem(REMEMBERED_EMAIL_KEY)
    }
}

// ==================== 主题相关 ====================

const THEME_KEY = 'theme'
const PRIMARY_COLOR_KEY = 'primary_color'

/**
 * 保存主题设置
 * @param {string} theme - 主题 (light/dark)
 */
export const saveTheme = (theme) => {
    setItem(THEME_KEY, theme)
}

/**
 * 获取主题设置
 * @returns {string}
 */
export const getTheme = () => {
    return getItem(THEME_KEY, 'light')
}

/**
 * 保存主色调
 * @param {string} color - 颜色值
 */
export const savePrimaryColor = (color) => {
    setItem(PRIMARY_COLOR_KEY, color)
}

/**
 * 获取主色调
 * @returns {string}
 */
export const getPrimaryColor = () => {
    return getItem(PRIMARY_COLOR_KEY, '#FF6B6B')
}

// ==================== 番茄钟设置 ====================

const POMODORO_SETTINGS_KEY = 'pomodoro_settings'

/**
 * 保存番茄钟设置
 * @param {Object} settings - 设置对象
 */
export const savePomodoroSettings = (settings) => {
    const current = getPomodoroSettings()
    setItem(POMODORO_SETTINGS_KEY, { ...current, ...settings })
}

/**
 * 获取番茄钟设置
 * @returns {Object}
 */
export const getPomodoroSettings = () => {
    return getItem(POMODORO_SETTINGS_KEY, {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreak: false,
        autoStartPomodoro: false
    })
}

export default {
    setItem,
    getItem,
    removeItem,
    clear,
    hasItem,
    getKeys,
    getSize,
    saveToken,
    getToken,
    removeToken,
    saveRefreshToken,
    getRefreshToken,
    saveUserId,
    getUserId,
    saveRememberMe,
    getRememberMe,
    saveRememberedEmail,
    getRememberedEmail,
    clearAuth,
    clearUserData,
    saveTheme,
    getTheme,
    savePrimaryColor,
    getPrimaryColor,
    savePomodoroSettings,
    getPomodoroSettings
}