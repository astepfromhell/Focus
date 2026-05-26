class WakeLockService {
    constructor() {
        this.wakeLock = null
        this.isActive = false
    }

    async request() {
        if (!('wakeLock' in navigator)) {
            console.warn('当前浏览器不支持屏幕唤醒锁')
            return false
        }

        if (this.isActive) return true

        try {
            this.wakeLock = await navigator.wakeLock.request('screen')
            this.isActive = true

            this.wakeLock.addEventListener('release', () => {
                this.isActive = false
            })

            return true
        } catch (err) {
            console.error('获取屏幕唤醒锁失败:', err)
            return false
        }
    }

    async release() {
        if (this.wakeLock && this.isActive) {
            await this.wakeLock.release()
            this.wakeLock = null
            this.isActive = false
        }
    }

    async toggle(enable) {
        if (enable) {
            return await this.request()
        } else {
            await this.release()
            return true
        }
    }
}

export const wakeLockService = new WakeLockService()