<template>
  <div class="assistant-page">
    <AppHeader title="AI 助手" emoji="🌱" />

    <div class="assistant-container">
      <!-- 离线提示 -->
      <div v-if="isOffline" class="offline-banner">
        <span class="offline-icon">📡</span>
        <span class="offline-text">当前无网络连接</span>
      </div>

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">🌱</div>
          <h3 class="empty-title">你好，我是你的智能助手</h3>
          <p class="empty-desc">
            我可以帮你创建任务、记录便签、<br />
            管理番茄钟，或者聊聊天 🍃
          </p>
          <div class="suggestions">
            <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                class="suggestion-chip"
                @click="sendSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <div v-else class="messages-list">
          <ChatBubble
              v-for="message in messages"
              :key="message.id"
              :message="message"
          />
          <TypingIndicator v-if="isLoading" />
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button v-if="lastFailedMessage" class="retry-btn" @click="retryLastMessage">
          <span class="retry-icon">⟳</span> 重试
        </button>
        <button class="close-btn" @click="clearError">✕</button>
      </div>

      <!-- 直接使用 MessageInput，不包装 -->
      <MessageInput
          v-model="inputText"
          :is-loading="isLoading"
          :is-offline="isOffline"
          :voice-state="voiceState"
          @send="sendMessage"
          @start-voice="startVoiceInput"
          @stop-voice="stopVoiceInput"
      />
    </div>

    <!-- 历史会话底部抽屉 -->
    <ConversationHistory
        v-if="showHistorySheet"
        :conversations="conversations"
        :is-loading="isLoadingHistory"
        :current-conversation-id="conversationId"
        @close="closeHistorySheet"
        @restore="restoreConversation"
        @delete="deleteConversation"
    />

    <!-- 清空确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showClearConfirm"
        title="清空对话"
        message="确定要清空所有对话记录吗？"
        confirm-text="清空"
        confirm-variant="danger"
        @confirm="clearConversation"
        @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useAiStore } from '@/stores/ai'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue'
import ChatBubble from './components/ChatBubble.vue'
import TypingIndicator from './components/TypingIndicator.vue'
import MessageInput from './components/MessageInput.vue'
import ConversationHistory from './components/ConversationHistory.vue'

const aiStore = useAiStore()

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

// 本地状态
const inputText = ref('')
const showClearConfirm = ref(false)
const messagesContainer = ref(null)

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

// 历史会话
const closeHistorySheet = () => {
  aiStore.closeHistorySheet()
}

const restoreConversation = async (id) => {
  await aiStore.restoreConversation(id)
}

const deleteConversation = async (id) => {
  await aiStore.deleteConversation(id)
}

// 语音输入（使用 Web Speech API）
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
    aiStore.onVoiceError('识别失败，请重试')
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

// 监听长按触发语音（从底部导航栏传来）
const handleAssistantLongPress = () => {
  startVoiceInput()
}

// 添加全局事件监听
onMounted(() => {
  window.addEventListener('assistant-long-press', handleAssistantLongPress)
  initSpeechRecognition()
})

onUnmounted(() => {
  window.removeEventListener('assistant-long-press', handleAssistantLongPress)
  if (recognition) {
    recognition.abort()
  }
})
</script>

<style scoped>
.assistant-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
}

.assistant-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;

}

/* 离线提示 */
.offline-banner {
  background: #FFF3CD;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 16px;
  border-radius: 12px;
}

.offline-icon {
  font-size: 14px;
}

.offline-text {
  font-size: 13px;
  color: #856404;
  font-weight: 500;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #2C3E2E;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #6A7B6E;
  line-height: 1.6;
  margin-bottom: 32px;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 280px;
}

.suggestion-chip {
  padding: 10px 16px;
  background: white;
  border: 1px solid #CFDEC4;
  border-radius: 24px;
  font-size: 13px;
  color: #5A8A4A;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: #F5F8EF;
  border-color: #92A681;
}

/* 错误横幅 */
.error-banner {
  background: #FDECEC;
  margin: 8px 16px;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 14px;
}

.error-text {
  flex: 1;
  font-size: 13px;
  color: #C62828;
}

.retry-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #8BC34A;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.retry-icon {
  font-size: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #C62828;
  cursor: pointer;
}
</style>