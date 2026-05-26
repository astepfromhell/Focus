import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('access_token') || null,
        refreshToken: localStorage.getItem('refresh_token') || null,
        userId: parseInt(localStorage.getItem('user_id') || '0') || null,
        isLoggedIn: !!localStorage.getItem('access_token'),
        rememberMe: localStorage.getItem('remember_me') === 'true'
    }),

    getters: {
        isAuthenticated: (state) => state.isLoggedIn && !!state.token
    },

    actions: {
        /**
         * 保存认证信息
         * @param {Object} data - 认证数据
         * @param {string} data.token - 访问令牌
         * @param {string} data.refreshToken - 刷新令牌
         * @param {Object} data.user - 用户信息
         * @param {boolean} rememberMe - 是否记住登录
         */
        saveAuthData(data, rememberMe = false) {
            this.token = data.token
            this.refreshToken = data.refreshToken
            this.userId = data.user.id
            this.isLoggedIn = true
            this.rememberMe = rememberMe

            localStorage.setItem('access_token', data.token)
            if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken)
            }
            localStorage.setItem('user_id', String(data.user.id))
            localStorage.setItem('remember_me', String(rememberMe))

            // 保存用户信息到 user store
            const userStore = useUserStore()
            userStore.setUser(data.user)
        },

        /**
         * 清除认证信息
         */
        clearAuthData() {
            this.token = null
            this.refreshToken = null
            this.userId = null
            this.isLoggedIn = false

            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_id')
            if (!this.rememberMe) {
                localStorage.removeItem('remember_me')
            }
        },

        /**
         * 用户登录
         * @param {string} email - 邮箱
         * @param {string} password - 密码
         * @param {boolean} rememberMe - 是否记住登录
         * @returns {Promise<Object>}
         */
        async login(email, password, rememberMe = false) {
            try {
                const response = await loginApi(email, password)
                if (response.success && response.data) {
                    this.saveAuthData(response.data, rememberMe)
                    return { success: true, user: response.data.user }
                }
                return { success: false, message: response.message || '登录失败' }
            } catch (error) {
                return { success: false, message: error.message || '登录失败' }
            }
        },

        /**
         * 用户注册
         * @param {string} username - 用户名
         * @param {string} email - 邮箱
         * @param {string} password - 密码
         * @returns {Promise<Object>}
         */
        async register(username, email, password) {
            try {
                const response = await registerApi(username, email, password)
                if (response.success && response.data) {
                    // 注册成功后自动登录
                    return await this.login(email, password, false)
                }
                return { success: false, message: response.message || '注册失败' }
            } catch (error) {
                return { success: false, message: error.message || '注册失败' }
            }
        },

        /**
         * 用户登出
         * @returns {Promise<Object>}
         */
        async logout() {
            try {
                await logoutApi()
            } catch (error) {
                // 忽略登出接口错误，仍然清除本地数据
                console.warn('登出接口调用失败:', error.message)
            } finally {
                this.clearAuthData()
            }
            return { success: true }
        },

        /**
         * 检查登录状态
         */
        checkLoginStatus() {
            const token = localStorage.getItem('access_token')
            if (token && !this.isLoggedIn) {
                this.token = token
                this.isLoggedIn = true
                const userId = localStorage.getItem('user_id')
                if (userId) {
                    this.userId = parseInt(userId)
                }
                const rememberMe = localStorage.getItem('remember_me')
                if (rememberMe) {
                    this.rememberMe = rememberMe === 'true'
                }
            }
            return this.isLoggedIn
        }
    }
})

// 避免循环依赖，在函数内导入
const useUserStore = () => {
    const { useUserStore: store } = require('./user')
    return store()
}