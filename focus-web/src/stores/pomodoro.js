import { defineStore } from 'pinia'
import { createSession, updateSession, getPomodoroSummary } from '@/api/pomodoro'

export const usePomodoroStore = defineStore('pomodoro', {
    state: () => ({
        // 计时器状态
        isRunning: false,
        isPaused: false,
        currentMode: 'WORK', // WORK | BREAK
        timeLeftSeconds: 25 * 60,
        workDurationSeconds: 25 * 60,
        breakDurationSeconds: 5 * 60,
        completedSessions: 0,
        totalFocusMinutes: 0,
        currentSessionId: null,

        // 预设
        selectedPreset: 'CLASSIC', // CLASSIC | LONG_FOCUS | SPRINT | CUSTOM
        customWorkMinutes: 25,
        customBreakMinutes: 5,

        // 今日统计
        todayCompletedCount: 0,
        todayTotalMinutes: 0,

        // 定时器句柄
        timerInterval: null,

        // 用户ID
        userId: null
    }),

    getters: {
        /**
         * 格式化显示时间 MM:SS
         */
        displayTime: (state) => {
            const minutes = Math.floor(state.timeLeftSeconds / 60)
            const seconds = state.timeLeftSeconds % 60
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        },

        /**
         * 状态文本
         */
        statusText: (state) => {
            if (!state.isRunning && !state.isPaused) return '准备开始'
            if (state.isPaused) return '已暂停'
            return state.currentMode === 'WORK' ? '专注中' : '休息中'
        },

        /**
         * 进度百分比 (0-100)
         */
        progress: (state) => {
            const total = state.currentMode === 'WORK' ? state.workDurationSeconds : state.breakDurationSeconds
            return ((total - state.timeLeftSeconds) / total) * 100
        },

        /**
         * 工作时长（分钟）
         */
        workDurationMinutes: (state) => state.workDurationSeconds / 60,

        /**
         * 休息时长（分钟）
         */
        breakDurationMinutes: (state) => state.breakDurationSeconds / 60,

        /**
         * 当前模式是否为工作模式
         */
        isWorkMode: (state) => state.currentMode === 'WORK',

        /**
         * 预设配置
         */
        presetConfig: () => ({
            CLASSIC: { work: 25, break: 5, icon: '🍅', name: '经典番茄' },
            LONG_FOCUS: { work: 50, break: 10, icon: '🪶', name: '长专注' },
            SPRINT: { work: 15, break: 3, icon: '⚡', name: '快速冲刺' },
            CUSTOM: { work: 25, break: 5, icon: '🤎', name: '自定义' }
        })
    },

    actions: {
        /**
         * 初始化（设置用户ID和加载统计数据）
         * @param {number} userId - 用户ID
         */
        async initialize(userId) {
            this.userId = userId
            await this.loadTodayStats()
        },

        /**
         * 加载今日统计数据
         */
        async loadTodayStats() {
            try {
                const response = await getPomodoroSummary()
                if (response.success && response.data) {
                    this.completedSessions = response.data.completedSessions || 0
                    this.totalFocusMinutes = response.data.totalFocusMinutes || 0
                    this.todayCompletedCount = response.data.completedSessions || 0
                    this.todayTotalMinutes = response.data.totalFocusMinutes || 0
                }
            } catch (error) {
                console.warn('加载番茄钟统计失败:', error.message)
            }
        },

        /**
         * 更新工作时长
         * @param {number} minutes - 分钟数
         */
        updateWorkDuration(minutes) {
            const validMinutes = Math.min(Math.max(minutes, 1), 180)
            this.customWorkMinutes = validMinutes
            if (this.selectedPreset === 'CUSTOM') {
                this.workDurationSeconds = validMinutes * 60
                if (!this.isRunning && !this.isPaused) {
                    this.timeLeftSeconds = this.workDurationSeconds
                }
            }
        },

        /**
         * 更新休息时长
         * @param {number} minutes - 分钟数
         */
        updateBreakDuration(minutes) {
            const validMinutes = Math.min(Math.max(minutes, 1), 60)
            this.customBreakMinutes = validMinutes
            if (this.selectedPreset === 'CUSTOM') {
                this.breakDurationSeconds = validMinutes * 60
                if (!this.isRunning && !this.isPaused && this.currentMode === 'BREAK') {
                    this.timeLeftSeconds = this.breakDurationSeconds
                }
            }
        },

        /**
         * 选择预设
         * @param {string} preset - 预设名称
         */
        selectPreset(preset) {
            this.selectedPreset = preset

            let workMinutes = this.customWorkMinutes
            let breakMinutes = this.customBreakMinutes

            if (preset === 'CLASSIC') {
                workMinutes = 25
                breakMinutes = 5
            } else if (preset === 'LONG_FOCUS') {
                workMinutes = 50
                breakMinutes = 10
            } else if (preset === 'SPRINT') {
                workMinutes = 15
                breakMinutes = 3
            } else if (preset === 'CUSTOM') {
                workMinutes = this.customWorkMinutes
                breakMinutes = this.customBreakMinutes
            }

            this.workDurationSeconds = workMinutes * 60
            this.breakDurationSeconds = breakMinutes * 60

            if (!this.isRunning && !this.isPaused) {
                this.timeLeftSeconds = this.currentMode === 'WORK' ? this.workDurationSeconds : this.breakDurationSeconds
            }
        },

        /**
         * 开始计时
         */
        async start() {
            if (this.isRunning) return false

            // 如果是工作模式且没有当前会话，创建新会话
            if (this.currentMode === 'WORK' && !this.currentSessionId) {
                await this.createNewSession()
            }

            this.isRunning = true
            this.isPaused = false
            this.startTimer()

            return true
        },

        /**
         * 创建新的番茄钟会话
         */
        async createNewSession() {
            try {
                const response = await createSession({
                    plannedDuration: this.workDurationMinutes,
                    tag: null,
                    notes: null
                })

                if (response.success && response.data?.session) {
                    this.currentSessionId = response.data.session.id
                }
            } catch (error) {
                console.warn('创建番茄钟会话失败:', error.message)
            }
        },

        /**
         * 启动定时器
         */
        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval)

            this.timerInterval = setInterval(() => {
                if (!this.isRunning) return

                if (this.timeLeftSeconds > 0) {
                    this.timeLeftSeconds--
                }

                if (this.timeLeftSeconds <= 0) {
                    this.onTimerComplete()
                }
            }, 1000)
        },

        /**
         * 计时完成
         */
        async onTimerComplete() {
            const wasWorkMode = this.currentMode === 'WORK'

            if (wasWorkMode && this.currentSessionId) {
                // 工作模式完成，更新会话状态
                const actualDuration = this.workDurationMinutes
                try {
                    await updateSession(this.currentSessionId, {
                        status: 'completed',
                        actualDuration
                    })
                    // 更新统计数据
                    this.completedSessions++
                    this.totalFocusMinutes += actualDuration
                    this.todayCompletedCount = this.completedSessions
                    this.todayTotalMinutes = this.totalFocusMinutes
                } catch (error) {
                    console.warn('更新会话状态失败:', error.message)
                }
                this.currentSessionId = null

                // 发送专注完成通知
                this.showNotification('🎉 专注完成！', '太棒了！休息一下吧 🌿')
            } else if (!wasWorkMode) {
                // 休息模式完成
                this.showNotification('☕ 休息结束', '准备好了吗？开始下一个专注吧！')
            }

            // 切换模式
            this.switchMode()

            // 工作模式完成，自动开始休息
            if (wasWorkMode) {
                this.isRunning = true
                this.startTimer()
            } else {
                this.isRunning = false
                this.isPaused = false
            }
        },

        /**
         * 切换工作/休息模式
         */
        switchMode() {
            if (this.currentMode === 'WORK') {
                this.currentMode = 'BREAK'
                this.timeLeftSeconds = this.breakDurationSeconds
            } else {
                this.currentMode = 'WORK'
                this.timeLeftSeconds = this.workDurationSeconds
            }
        },

        /**
         * 暂停计时
         */
        pause() {
            if (!this.isRunning) return
            this.isRunning = false
            this.isPaused = true
        },

        /**
         * 重置计时器
         */
        async reset() {
            // 取消当前会话
            if (this.currentSessionId) {
                try {
                    await updateSession(this.currentSessionId, { status: 'cancelled' })
                } catch (error) {
                    console.warn('取消会话失败:', error.message)
                }
                this.currentSessionId = null
            }

            // 停止定时器
            if (this.timerInterval) {
                clearInterval(this.timerInterval)
                this.timerInterval = null
            }

            this.isRunning = false
            this.isPaused = false
            this.currentMode = 'WORK'
            this.timeLeftSeconds = this.workDurationSeconds
        },

        /**
         * 跳过当前阶段
         */
        async skip() {
            const wasWorkMode = this.currentMode === 'WORK'

            if (wasWorkMode && this.currentSessionId) {
                try {
                    await updateSession(this.currentSessionId, { status: 'cancelled' })
                } catch (error) {
                    console.warn('取消会话失败:', error.message)
                }
                this.currentSessionId = null
            }

            // 停止定时器
            if (this.timerInterval) {
                clearInterval(this.timerInterval)
                this.timerInterval = null
            }

            this.switchMode()

            if (wasWorkMode) {
                this.isRunning = true
                this.startTimer()
            } else {
                this.isRunning = false
                this.isPaused = false
            }
        },

        /**
         * 显示浏览器通知
         * @param {string} title - 标题
         * @param {string} body - 内容
         */
        showNotification(title, body) {
            if (!('Notification' in window)) return
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/favicon.ico' })
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission()
            }
        },

        /**
         * 清理定时器
         */
        cleanup() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval)
                this.timerInterval = null
            }
        }
    }
})