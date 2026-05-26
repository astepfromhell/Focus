export function useNotification() {
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            console.warn('浏览器不支持通知')
            return false
        }

        if (Notification.permission === 'granted') {
            return true
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }

        return false
    }

    const showNotification = async (title, options = {}) => {
        const hasPermission = await requestPermission()
        if (!hasPermission) return

        const defaultOptions = {
            body: '',
            icon: '/favicon.ico',
            silent: false,
            ...options
        }

        new Notification(title, defaultOptions)
    }

    const showTaskReminder = (taskTitle, type) => {
        const title = type === 'start' ? '⏰ 任务即将开始' : '⚠️ 任务即将截止'
        const body = type === 'start'
            ? `「${taskTitle}」将在 5 分钟后开始`
            : `「${taskTitle}」即将截止，请注意完成`
        showNotification(title, { body })
    }

    const showPomodoroNotification = (type, duration = 0) => {
        if (type === 'start') {
            showNotification('🍅 专注开始', { body: `专注 ${duration} 分钟，加油！` })
        } else if (type === 'complete') {
            showNotification('🎉 专注完成！', { body: '太棒了！休息一下吧 🌿' })
        } else if (type === 'breakStart') {
            showNotification('☕ 休息时间', { body: `休息 ${duration} 分钟，放松一下 🌱` })
        } else if (type === 'breakEnd') {
            showNotification('☕ 休息结束', { body: '准备好了吗？开始下一个专注吧！' })
        }
    }

    return {
        requestPermission,
        showNotification,
        showTaskReminder,
        showPomodoroNotification
    }
}