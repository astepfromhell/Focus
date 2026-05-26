import { defineStore } from 'pinia'
import { getCurrentUser, getSettings, updatePomodoroSettings, updateThemeSettings, updateNotificationSettings, changePassword } from '@/api/user'

export const useUserStore = defineStore('user', {
    state: () => ({
        // 用户信息
        user: null,
        isLoadingUser: false,
        userError: null,

        // 用户设置
        settings: {
            pomodoroDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            autoStartBreak: false,
            autoStartPomodoro: false,
            enableNotifications: true,
            notificationSound: true,
            soundVolume: 50,
            theme: 'light',
            primaryColor: '#FF6B6B',
            backgroundImageUrl: null,
            fontSize: 'medium',
            language: 'zh-CN'
        },
        isLoadingSettings: false,
        settingsError: null
    }),

    getters: {
        /**
         * 获取用户显示名
         */
        displayName: (state) => state.user?.username || '用户',

        /**
         * 获取用户邮箱（脱敏显示）
         */
        maskedEmail: (state) => {
            const email = state.user?.email
            if (!email) return ''
            const [name, domain] = email.split('@')
            if (name.length <= 3) return email
            return `${name.slice(0, 3)}***@${domain}`
        },

        /**
         * 获取注册天数
         */
        registeredDays: (state) => {
            const createdAt = state.user?.createdAt
            if (!createdAt) return 0
            const createDate = new Date(createdAt)
            const now = new Date()
            const diff = now - createDate
            return Math.floor(diff / (1000 * 60 * 60 * 24))
        }
    },

    actions: {
        /**
         * 设置用户信息
         * @param {Object} userData - 用户数据
         */
        setUser(userData) {
            this.user = userData
        },

        /**
         * 加载当前用户信息
         * @returns {Promise<Object>}
         */
        async loadCurrentUser() {
            this.isLoadingUser = true
            this.userError = null

            try {
                const response = await getCurrentUser()
                if (response.success && response.data) {
                    this.user = response.data.user
                    if (response.data.settings) {
                        this.settings = { ...this.settings, ...response.data.settings }
                    }
                    return { success: true, user: this.user }
                }
                this.userError = response.message || '加载用户信息失败'
                return { success: false, message: this.userError }
            } catch (error) {
                this.userError = error.message || '加载用户信息失败'
                return { success: false, message: this.userError }
            } finally {
                this.isLoadingUser = false
            }
        },

        /**
         * 加载用户设置
         * @returns {Promise<Object>}
         */
        async loadSettings() {
            this.isLoadingSettings = true
            this.settingsError = null

            try {
                const response = await getSettings()
                if (response.success && response.data?.settings) {
                    this.settings = { ...this.settings, ...response.data.settings }
                    return { success: true, settings: this.settings }
                }
                this.settingsError = response.message || '加载设置失败'
                return { success: false, message: this.settingsError }
            } catch (error) {
                this.settingsError = error.message || '加载设置失败'
                return { success: false, message: this.settingsError }
            } finally {
                this.isLoadingSettings = false
            }
        },

        /**
         * 保存番茄钟设置
         * @param {Object} data - 设置数据
         * @returns {Promise<Object>}
         */
        async savePomodoroSettings(data) {
            try {
                const response = await updatePomodoroSettings(data)
                if (response.success && response.data?.settings) {
                    this.settings = { ...this.settings, ...response.data.settings }
                    return { success: true, settings: this.settings }
                }
                return { success: false, message: response.message || '保存失败' }
            } catch (error) {
                return { success: false, message: error.message || '保存失败' }
            }
        },

        /**
         * 保存主题设置
         * @param {Object} data - 设置数据
         * @returns {Promise<Object>}
         */
        async saveThemeSettings(data) {
            try {
                const response = await updateThemeSettings(data)
                if (response.success && response.data?.settings) {
                    this.settings = { ...this.settings, ...response.data.settings }
                    // 应用主题到 DOM
                    this.applyTheme()
                    return { success: true, settings: this.settings }
                }
                return { success: false, message: response.message || '保存失败' }
            } catch (error) {
                return { success: false, message: error.message || '保存失败' }
            }
        },

        /**
         * 保存通知设置
         * @param {Object} data - 设置数据
         * @returns {Promise<Object>}
         */
        async saveNotificationSettings(data) {
            try {
                const response = await updateNotificationSettings(data)
                if (response.success && response.data?.settings) {
                    this.settings = { ...this.settings, ...response.data.settings }
                    return { success: true, settings: this.settings }
                }
                return { success: false, message: response.message || '保存失败' }
            } catch (error) {
                return { success: false, message: error.message || '保存失败' }
            }
        },

        /**
         * 修改密码
         * @param {string} oldPassword - 旧密码
         * @param {string} newPassword - 新密码
         * @returns {Promise<Object>}
         */
        async changePassword(oldPassword, newPassword) {
            try {
                const response = await changePassword(oldPassword, newPassword)
                if (response.success) {
                    return { success: true, message: response.message || '密码修改成功' }
                }
                return { success: false, message: response.message || '修改失败' }
            } catch (error) {
                return { success: false, message: error.message || '修改失败' }
            }
        },

        /**
         * 应用主题到 DOM
         */
        applyTheme() {
            const { theme, primaryColor } = this.settings
            document.documentElement.setAttribute('data-theme', theme)

            if (primaryColor) {
                document.documentElement.style.setProperty('--primary-color', primaryColor)
            }
        },

        /**
         * 清除用户数据（登出时调用）
         */
        clearUserData() {
            this.user = null
            this.userError = null
            this.settings = {
                pomodoroDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                autoStartBreak: false,
                autoStartPomodoro: false,
                enableNotifications: true,
                notificationSound: true,
                soundVolume: 50,
                theme: 'light',
                primaryColor: '#FF6B6B',
                backgroundImageUrl: null,
                fontSize: 'medium',
                language: 'zh-CN'
            }
            this.settingsError = null
        }
    }
})