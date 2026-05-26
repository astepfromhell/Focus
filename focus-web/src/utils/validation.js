/**
 * 表单验证工具类
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} { valid, message }
 */
export const validateUsername = (username) => {
    if (!username || username.trim() === '') {
        return { valid: false, message: '请输入用户名' }
    }

    const trimmed = username.trim()

    if (trimmed.length < 4) {
        return { valid: false, message: '用户名至少需要4个字符' }
    }

    if (trimmed.length > 20) {
        return { valid: false, message: '用户名不能超过20个字符' }
    }

    // 用户名只能包含字母、数字、下划线和中文
    const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
    if (!usernameRegex.test(trimmed)) {
        return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证邮箱（带错误消息）
 * @param {string} email - 邮箱地址
 * @returns {Object} { valid, message }
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return { valid: false, message: '请输入邮箱地址' }
    }

    const trimmed = email.trim()

    if (!isValidEmail(trimmed)) {
        return { valid: false, message: '请输入有效的邮箱地址' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证密码格式
 * @param {string} password - 密码
 * @returns {Object} { valid, message }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: '请输入密码' }
    }

    if (password.length < 6) {
        return { valid: false, message: '密码长度至少为6位' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证确认密码是否匹配
 * @param {string} password - 密码
 * @param {string} confirmPassword - 确认密码
 * @returns {Object} { valid, message }
 */
export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { valid: false, message: '请再次输入密码' }
    }

    if (password !== confirmPassword) {
        return { valid: false, message: '两次输入的密码不一致' }
    }

    return { valid: true, message: '' }
}

/**
 * 计算密码强度
 * @param {string} password - 密码
 * @returns {Object} { strength, label, color, progress }
 */
export const calculatePasswordStrength = (password) => {
    if (!password) {
        return { strength: 'NONE', label: '', color: 'transparent', progress: 0 }
    }

    let score = 0

    // 长度检查
    if (password.length >= 6) score++
    if (password.length >= 10) score++

    // 大小写字母检查
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++

    // 数字检查
    if (/\d/.test(password)) score++

    // 特殊字符检查
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) {
        return { strength: 'WEAK', label: '弱', color: '#DC2626', progress: 0.33 }
    }
    if (score <= 3) {
        return { strength: 'MEDIUM', label: '中', color: '#D97706', progress: 0.66 }
    }
    return { strength: 'STRONG', label: '强', color: '#16A34A', progress: 1 }
}

/**
 * 验证任务标题
 * @param {string} title - 任务标题
 * @returns {Object} { valid, message }
 */
export const validateTaskTitle = (title) => {
    if (!title || title.trim() === '') {
        return { valid: false, message: '请输入任务标题' }
    }

    if (title.length > 100) {
        return { valid: false, message: '任务标题不能超过100个字符' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证任务时间（短任务）
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {Object} { valid, message }
 */
export const validateTaskTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
        return { valid: true, message: '' }
    }

    if (startTime >= endTime) {
        return { valid: false, message: '结束时间必须晚于开始时间' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证任务日期范围（长任务）
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Object} { valid, message }
 */
export const validateTaskDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return { valid: true, message: '' }
    }

    if (startDate >= endDate) {
        return { valid: false, message: '结束日期必须晚于开始日期' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证便签内容
 * @param {string} content - 便签内容
 * @returns {Object} { valid, message }
 */
export const validateNoteContent = (content) => {
    if (!content || content.trim() === '') {
        return { valid: false, message: '请输入便签内容' }
    }

    if (content.length > 5000) {
        return { valid: false, message: '便签内容不能超过5000个字符' }
    }

    return { valid: true, message: '' }
}

/**
 * 验证 URL 格式
 * @param {string} url - URL
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
    if (!url) return false
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * 验证手机号（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    if (!phone) return false
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
}

/**
 * 验证是否为非空字符串
 * @param {string} value - 值
 * @returns {boolean}
 */
export const isNotEmpty = (value) => {
    return value !== null && value !== undefined && value.trim() !== ''
}

/**
 * 验证数字范围
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean}
 */
export const isInRange = (value, min, max) => {
    return value >= min && value <= max
}

export default {
    isValidEmail,
    validateUsername,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    calculatePasswordStrength,
    validateTaskTitle,
    validateTaskTime,
    validateTaskDateRange,
    validateNoteContent,
    isValidUrl,
    isValidPhone,
    isNotEmpty,
    isInRange
}