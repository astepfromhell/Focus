import { ref, computed, watch, nextTick } from 'vue'
import { useAiStore } from '@/stores/ai'

/**
 * AI 助手组合式函数
 * 封装消息发送、语音输入、历史会话等业务逻辑
 */
export function useAiAssistant() {
    const aiStore = useAiStore()

    // 本地状态
    const inputText = ref('')
    const showClearConfirm = ref(false)
    const messagesContainer = ref(null)

    // 从 store 获取状态
    const messages = computed(() => aiStore.messages)
    const isLoading = computed(() => aiStore.isLoading)
    const error = computed(() => aiStore.error)
    const conversationId = computed(() => aiStore.conversationId)
    const isOffline = computed(() => aiStore.isOffline)
    const lastFailedMessage = computed(() => aiStore.lastFailedMessage)
    const conversations = computed(() => aiStore.conversations)
    const isLoadingHistory = computed(() => aiStore.isLoadingHistory)
    const showHistorySheet = computed(() => aiStore.showHistorySheet)
    const voiceState = computed(() => aiStore.voiceState)

    // 建议列表
    const suggestions = [
        '帮我创建一个明天的任务',
        '记个便签：买牛奶',
        '开始一个 25 分钟的专注',
        '我今天完成了多少任务？'
    ]

    // 滚动到底部
    const scrollToBottom = async () => {
        await nextTick()
        if (messagesContainer.value) {
            const container = messagesContainer.value
            container.scrollTop = container.scrollHeight
        }
    }

    // 监听消息变化，自动滚动
    watch(
        () => [messages.value.length, isLoading.value],
        () => {
            scrollToBottom()
        }
    )

    // 发送消息
    const sendMessage = async () => {
        if (!inputText.value.trim()) return
        const text = inputText.value
        inputText.value = ''
        await aiStore.sendMessage(text)
    }

    // 发送建议
    const sendSuggestion = (text) => {
        inputText.value = text
        sendMessage()
    }

    // 重试最后一条消息
    const retryLastMessage = async () => {
        await aiStore.retryLastMessage()
    }

    // 清除错误
    const clearError = () => {
        aiStore.clearError()
    }

    // 清空对话
    const clearConversation = async () => {
        await aiStore.clearConversation()
        showClearConfirm.value = false
    }

    // 开始新对话
    const startNewConversation = () => {
        aiStore.startNewConversation()
    }

    // 历史会话相关
    const openHistorySheet = () => {
        aiStore.openHistorySheet()
    }

    const closeHistorySheet = () => {
        aiStore.closeHistorySheet()
    }

    const restoreConversation = async (id) => {
        await aiStore.restoreConversation(id)
    }

    const deleteConversation = async (id) => {
        await aiStore.deleteConversation(id)
    }

    // 语音输入（Web Speech API）
    let recognition = null

    const initSpeechRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('浏览器不支持语音识别')
            return false
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'zh-CN'

        recognition.onstart = () => {
            aiStore.setVoiceState('listening')
        }

        recognition.onend = () => {
            if (aiStore.voiceState === 'listening') {
                aiStore.setVoiceState('idle')
            }
        }

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1]
            const text = result[0].transcript
            aiStore.setVoiceState('recognizing')
            setTimeout(() => {
                aiStore.onVoiceResult(text)
                inputText.value = text
                aiStore.setVoiceState('idle')
                sendMessage()
            }, 500)
        }

        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error)
            let errorMsg = '识别失败，请重试'
            if (event.error === 'not-allowed') {
                errorMsg = '请允许麦克风权限'
            } else if (event.error === 'network') {
                errorMsg = '网络错误，请检查网络'
            }
            aiStore.onVoiceError(errorMsg)
            aiStore.setVoiceState('idle')
        }

        return true
    }

    const startVoiceInput = () => {
        if (!recognition) {
            const supported = initSpeechRecognition()
            if (!supported) {
                aiStore.onVoiceError('当前浏览器不支持语音识别')
                return
            }
        }
        try {
            recognition.start()
        } catch (e) {
            console.error('启动语音识别失败:', e)
            aiStore.onVoiceError('启动失败，请重试')
        }
    }

    const stopVoiceInput = () => {
        if (recognition) {
            try {
                recognition.stop()
            } catch (e) {
                // 忽略
            }
        }
    }

    // 清理语音识别
    const cleanupSpeechRecognition = () => {
        if (recognition) {
            try {
                recognition.abort()
            } catch (e) {
                // 忽略
            }
            recognition = null
        }
    }

    // 长按助手按钮回调（从底部导航栏触发）
    const handleAssistantLongPress = () => {
        startVoiceInput()
    }

    // 注册全局事件监听
    const registerLongPressListener = () => {
        window.addEventListener('assistant-long-press', handleAssistantLongPress)
    }

    const unregisterLongPressListener = () => {
        window.removeEventListener('assistant-long-press', handleAssistantLongPress)
    }

    return {
        // 状态
        inputText,
        showClearConfirm,
        messagesContainer,
        messages,
        isLoading,
        error,
        conversationId,
        isOffline,
        lastFailedMessage,
        conversations,
        isLoadingHistory,
        showHistorySheet,
        voiceState,
        suggestions,

        // 方法
        sendMessage,
        sendSuggestion,
        retryLastMessage,
        clearError,
        clearConversation,
        startNewConversation,
        openHistorySheet,
        closeHistorySheet,
        restoreConversation,
        deleteConversation,
        startVoiceInput,
        stopVoiceInput,
        cleanupSpeechRecognition,
        registerLongPressListener,
        unregisterLongPressListener,
        scrollToBottom
    }
}