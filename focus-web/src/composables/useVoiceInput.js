import { ref, onUnmounted } from 'vue'

export function useVoiceInput() {
    const isListening = ref(false)
    const isRecognizing = ref(false)
    const error = ref(null)
    const result = ref('')

    let recognition = null

    const initRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            error.value = '浏览器不支持语音识别'
            return false
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'zh-CN'

        recognition.onstart = () => {
            isListening.value = true
            isRecognizing.value = false
            error.value = null
        }

        recognition.onend = () => {
            isListening.value = false
        }

        recognition.onresult = (event) => {
            const text = event.results[event.results.length - 1][0].transcript
            isRecognizing.value = true
            setTimeout(() => {
                result.value = text
                isRecognizing.value = false
                isListening.value = false
            }, 500)
        }

        recognition.onerror = (event) => {
            error.value = event.error === 'not-allowed'
                ? '请允许麦克风权限'
                : event.error === 'network'
                    ? '网络错误，请检查网络'
                    : '识别失败，请重试'
            isListening.value = false
            isRecognizing.value = false
        }

        return true
    }

    const startListening = () => {
        if (!recognition) {
            const success = initRecognition()
            if (!success) return
        }
        try {
            recognition.start()
        } catch (e) {
            error.value = '启动失败，请重试'
        }
    }

    const stopListening = () => {
        if (recognition) {
            try {
                recognition.stop()
            } catch (e) {
                // 忽略
            }
        }
    }

    const reset = () => {
        result.value = ''
        error.value = null
        isListening.value = false
        isRecognizing.value = false
    }

    onUnmounted(() => {
        if (recognition) {
            recognition.abort()
        }
    })

    return {
        isListening,
        isRecognizing,
        error,
        result,
        startListening,
        stopListening,
        reset
    }
}