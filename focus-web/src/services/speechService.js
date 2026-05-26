class SpeechService {
    constructor() {
        this.recognition = null
        this.isListening = false
        this.callbacks = {
            onStart: null,
            onEnd: null,
            onResult: null,
            onError: null
        }
    }

    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('浏览器不支持语音识别')
            return false
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'zh-CN'

        this.recognition.onstart = () => {
            this.isListening = true
            if (this.callbacks.onStart) this.callbacks.onStart()
        }

        this.recognition.onend = () => {
            this.isListening = false
            if (this.callbacks.onEnd) this.callbacks.onEnd()
        }

        this.recognition.onresult = (event) => {
            const text = event.results[event.results.length - 1][0].transcript
            if (this.callbacks.onResult) this.callbacks.onResult(text)
        }

        this.recognition.onerror = (event) => {
            let errorMsg = '识别失败，请重试'
            if (event.error === 'not-allowed') errorMsg = '请允许麦克风权限'
            else if (event.error === 'network') errorMsg = '网络错误，请检查网络'
            if (this.callbacks.onError) this.callbacks.onError(errorMsg)
        }

        return true
    }

    start() {
        if (!this.recognition) {
            const success = this.init()
            if (!success) return false
        }
        try {
            this.recognition.start()
            return true
        } catch (e) {
            return false
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop()
        }
    }

    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback
        }
    }
}

export const speechService = new SpeechService()