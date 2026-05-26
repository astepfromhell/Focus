class NotificationService {
    async requestPermission() {
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

    show(title, options = {}) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                ...options
            })
        }
    }

    showTaskReminder(taskTitle, type) {
        const title = type === 'start' ? '⏰ 任务即将开始' : '⚠️ 任务即将截止'
        const body = type === 'start'
            ? `「${taskTitle}」将在 5 分钟后开始`
            : `「${taskTitle}」即将截止，请注意完成`
        this.show(title, { body })
    }
}

export const notificationService = new NotificationService()