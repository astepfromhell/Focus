import { defineStore } from 'pinia'
import { getTasks, getTodayTasks, getCalendarTasks, getTask, createTask, updateTask, deleteTask, completeTask } from '@/api/task'
import dayjs from 'dayjs'

export const useTaskStore = defineStore('task', {
    state: () => ({
        // 今日视图数据
        shortTasks: [],
        longTasks: [],

        // 日历视图数据
        currentYearMonth: dayjs().format('YYYY-MM'),
        calendarTasks: new Map(), // LocalDate string -> Task[]

        // 当前选中的日期
        selectedDate: null,

        // 视图类型
        currentView: 'TODAY', // TODAY | CALENDAR

        // 加载状态
        isLoading: false,
        isSaving: false,
        errorMessage: null,

        // 编辑器状态
        showEditor: false,
        editingTask: null,
        editorInitialDate: null,

        // 删除确认
        showDeleteConfirm: false,
        taskToDelete: null
    }),

    getters: {
        /**
         * 当前月份的第一天
         */
        firstDayOfMonth: (state) => {
            return dayjs(state.currentYearMonth).startOf('month').format('YYYY-MM-DD')
        },

        /**
         * 当前月份的最后一天
         */
        lastDayOfMonth: (state) => {
            return dayjs(state.currentYearMonth).endOf('month').format('YYYY-MM-DD')
        },

        /**
         * 今日任务总数
         */
        todayTaskCount: (state) => state.shortTasks.length + state.longTasks.length,

        /**
         * 今日未完成任务数
         */
        todayPendingCount: (state) => {
            const allTasks = [...state.shortTasks, ...state.longTasks]
            return allTasks.filter(t => !t.isCompleted).length
        },

        /**
         * 今日已完成任务数
         */
        todayCompletedCount: (state) => {
            const allTasks = [...state.shortTasks, ...state.longTasks]
            return allTasks.filter(t => t.isCompleted).length
        }
    },

    actions: {
        /**
         * 加载今日任务
         */
        async loadTodayTasks() {
            this.isLoading = true
            this.errorMessage = null

            try {
                const response = await getTodayTasks()
                if (response.success && response.data?.items) {
                    const tasks = this.transformTasks(response.data.items)
                    this.shortTasks = tasks.filter(t => t.type === 'SHORT')
                    this.longTasks = tasks.filter(t => t.type === 'LONG')
                    return { success: true, shortTasks: this.shortTasks, longTasks: this.longTasks }
                }
                this.errorMessage = response.message || '加载今日任务失败'
                return { success: false, message: this.errorMessage }
            } catch (error) {
                this.errorMessage = error.message || '加载今日任务失败'
                return { success: false, message: this.errorMessage }
            } finally {
                this.isLoading = false
            }
        },

        /**
         * 加载日历任务
         */
        async loadCalendarTasks() {
            this.isLoading = true
            this.errorMessage = null

            try {
                const startDate = this.firstDayOfMonth
                const endDate = this.lastDayOfMonth
                const response = await getCalendarTasks(startDate, endDate)

                if (response.success && response.data?.dates) {
                    const tasksMap = new Map()
                    response.data.dates.forEach(dateItem => {
                        const date = dateItem.date
                        const shortTasks = (dateItem.shortTasks || []).map(t => this.transformTask(t))
                        const longTasks = (dateItem.longTasks || []).map(t => this.transformTask(t))
                        tasksMap.set(date, [...shortTasks, ...longTasks])
                    })
                    this.calendarTasks = tasksMap
                    return { success: true, tasksMap }
                }
                this.errorMessage = response.message || '加载日历任务失败'
                return { success: false, message: this.errorMessage }
            } catch (error) {
                this.errorMessage = error.message || '加载日历任务失败'
                return { success: false, message: this.errorMessage }
            } finally {
                this.isLoading = false
            }
        },

        /**
         * 切换月份
         * @param {number} delta - 变化量（1=下月，-1=上月）
         */
        async changeMonth(delta) {
            const newMonth = dayjs(this.currentYearMonth).add(delta, 'month')
            this.currentYearMonth = newMonth.format('YYYY-MM')
            await this.loadCalendarTasks()
        },

        /**
         * 回到今天
         */
        async goToToday() {
            this.currentYearMonth = dayjs().format('YYYY-MM')
            await this.loadCalendarTasks()
            this.selectedDate = dayjs().format('YYYY-MM-DD')
        },

        /**
         * 选择日期
         * @param {string} date - 日期 (YYYY-MM-DD)
         */
        selectDate(date) {
            this.selectedDate = date
        },

        /**
         * 清除选中的日期
         */
        clearSelectedDate() {
            this.selectedDate = null
        },

        /**
         * 切换视图
         * @param {string} view - 视图类型 (TODAY/CALENDAR)
         */
        switchView(view) {
            this.currentView = view
            if (view === 'TODAY') {
                this.loadTodayTasks()
            } else {
                this.loadCalendarTasks()
            }
        },

        /**
         * 显示任务编辑器
         * @param {Object} task - 要编辑的任务（可选）
         * @param {string} initialDate - 初始日期（可选）
         */
        showTaskEditor(task = null, initialDate = null) {
            this.editingTask = task
            this.editorInitialDate = initialDate || dayjs().format('YYYY-MM-DD')
            this.showEditor = true
        },

        /**
         * 隐藏任务编辑器
         */
        hideTaskEditor() {
            this.showEditor = false
            this.editingTask = null
            this.editorInitialDate = null
        },

        /**
         * 保存任务
         * @param {Object} taskData - 任务数据
         */
        async saveTask(taskData) {
            this.isSaving = true
            this.errorMessage = null

            try {
                let response
                if (taskData.id && taskData.id > 0) {
                    response = await updateTask(taskData.id, this.buildUpdateRequest(taskData))
                } else {
                    response = await createTask(this.buildCreateRequest(taskData))
                }

                if (response.success && response.data?.task) {
                    const savedTask = this.transformTask(response.data.task)
                    await this.refreshCurrentView()
                    this.hideTaskEditor()
                    return { success: true, task: savedTask }
                }
                this.errorMessage = response.message || '保存任务失败'
                return { success: false, message: this.errorMessage }
            } catch (error) {
                this.errorMessage = error.message || '保存任务失败'
                return { success: false, message: this.errorMessage }
            } finally {
                this.isSaving = false
            }
        },

        /**
         * 切换任务完成状态
         * @param {Object} task - 任务对象
         */
        async toggleComplete(task) {
            try {
                const newCompleted = !task.isCompleted
                const response = await completeTask(task.id)

                if (response.success && response.data?.task) {
                    const updatedTask = this.transformTask(response.data.task)
                    await this.refreshCurrentView()
                    return { success: true, task: updatedTask }
                }
                return { success: false, message: response.message || '操作失败' }
            } catch (error) {
                return { success: false, message: error.message || '操作失败' }
            }
        },

        /**
         * 显示删除确认对话框
         * @param {Object} task - 要删除的任务
         */
        showDeleteConfirm(task) {
            this.taskToDelete = task
            this.showDeleteConfirm = true
        },

        /**
         * 隐藏删除确认对话框
         */
        hideDeleteConfirm() {
            this.showDeleteConfirm = false
            this.taskToDelete = null
        },

        /**
         * 确认删除任务
         */
        async confirmDelete() {
            if (!this.taskToDelete) return

            try {
                const response = await deleteTask(this.taskToDelete.id)
                if (response.success) {
                    await this.refreshCurrentView()
                    this.hideDeleteConfirm()
                    return { success: true }
                }
                this.errorMessage = response.message || '删除任务失败'
                return { success: false, message: this.errorMessage }
            } catch (error) {
                this.errorMessage = error.message || '删除任务失败'
                return { success: false, message: this.errorMessage }
            }
        },

        /**
         * 刷新当前视图
         */
        async refreshCurrentView() {
            if (this.currentView === 'TODAY') {
                await this.loadTodayTasks()
            } else {
                await this.loadCalendarTasks()
            }
        },

        /**
         * 清除错误信息
         */
        clearError() {
            this.errorMessage = null
        },

        /**
         * 获取选中日期的任务
         */
        getTasksForSelectedDate() {
            if (!this.selectedDate) return { shortTasks: [], longTasks: [] }
            const tasks = this.calendarTasks.get(this.selectedDate) || []
            return {
                shortTasks: tasks.filter(t => t.type === 'SHORT'),
                longTasks: tasks.filter(t => t.type === 'LONG')
            }
        },

        /**
         * 转换任务数据
         * @param {Object} task - 原始任务数据
         */
        transformTask(task) {
            return {
                ...task,
                type: task.type === 'long' ? 'LONG' : 'SHORT',
                isCompleted: task.status === 'completed',
                date: task.startDate ? dayjs(task.startDate).format('YYYY-MM-DD') : null,
                startDate: task.startDate,
                endDate: task.endDate,
                startTime: task.startTime ? task.startTime.substring(0, 5) : null,
                endTime: task.dueTime ? task.dueTime.substring(0, 5) : null
            }
        },

        /**
         * 批量转换任务数据
         * @param {Array} tasks - 原始任务列表
         */
        transformTasks(tasks) {
            return tasks.map(t => this.transformTask(t))
        },

        /**
         * 构建创建请求数据
         * @param {Object} taskData - 任务数据
         */
        buildCreateRequest(taskData) {
            const isShort = taskData.type === 'SHORT'
            return {
                title: taskData.title,
                description: taskData.description || null,
                type: isShort ? 'short' : 'long',
                priority: taskData.priority || 'medium',
                status: 'pending',
                reminder: taskData.reminder || false,
                tags: taskData.tags || null,
                start_date: isShort ? taskData.date : taskData.startDate,
                end_date: isShort ? null : taskData.endDate,
                start_time: isShort ? (taskData.startTime ? `${taskData.startTime}:00` : null) : null,
                due_time: isShort ? (taskData.endTime ? `${taskData.endTime}:00` : null) : null
            }
        },

        /**
         * 构建更新请求数据
         * @param {Object} taskData - 任务数据
         */
        buildUpdateRequest(taskData) {
            const isShort = taskData.type === 'SHORT'
            return {
                title: taskData.title,
                description: taskData.description || null,
                type: isShort ? 'short' : 'long',
                priority: taskData.priority || 'medium',
                reminder: taskData.reminder || false,
                tags: taskData.tags || null,
                start_date: isShort ? taskData.date : taskData.startDate,
                end_date: isShort ? null : taskData.endDate,
                start_time: isShort ? (taskData.startTime ? `${taskData.startTime}:00` : null) : null,
                due_time: isShort ? (taskData.endTime ? `${taskData.endTime}:00` : null) : null
            }
        },

        /**
         * 清空所有任务数据（登出时调用）
         */
        clearAllTasks() {
            this.shortTasks = []
            this.longTasks = []
            this.calendarTasks.clear()
            this.selectedDate = null
            this.currentView = 'TODAY'
            this.errorMessage = null
            this.showEditor = false
            this.editingTask = null
            this.showDeleteConfirm = false
            this.taskToDelete = null
        }
    }
})