import { post, get } from './client'

/**
 * 认证相关 API
 */

/**
 * 用户登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise<{success: boolean, data: {token: string, refreshToken: string, user: {id: number, username: string, email: string, avatarUrl: string|null}}, message: string}>}
 */
export const login = (email, password) => {
    return post('auth/login', { email, password })
}

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise<{success: boolean, data: {token: string, refreshToken: string, user: {id: number, username: string, email: string, avatarUrl: string|null}}, message: string}>}
 */
export const register = (username, email, password) => {
    return post('auth/register', { username, email, password })
}

/**
 * 检查用户名是否可用
 * @param {string} username - 用户名
 * @returns {Promise<{success: boolean, data: {available: boolean}, message: string}>}
 */
export const checkUsername = (username) => {
    return get('auth/check-username', { username })
}

/**
 * 检查邮箱是否可用
 * @param {string} email - 邮箱
 * @returns {Promise<{success: boolean, data: {available: boolean}, message: string}>}
 */
export const checkEmail = (email) => {
    return get('auth/check-email', { email })
}

/**
 * 用户登出
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const logout = () => {
    return post('auth/logout')
}