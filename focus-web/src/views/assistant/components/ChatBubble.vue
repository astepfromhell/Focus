<template>
  <div class="chat-bubble" :class="{ user: isUser, assistant: !isUser }">
    <!-- AI 头像 -->
    <div v-if="!isUser" class="avatar">
      <span class="avatar-emoji">🌱</span>
    </div>

    <div class="bubble-container">
      <div class="bubble" :class="{ user: isUser, assistant: !isUser }">
        <div class="bubble-content">{{ message.content }}</div>
        <div v-if="actionSuccess !== undefined" class="action-chip" :class="{ success: actionSuccess }">
          <span class="chip-icon">{{ actionSuccess ? '✅' : '❌' }}</span>
          <span>{{ actionSuccess ? '操作成功' : '操作失败' }}</span>
        </div>
      </div>
      <div class="timestamp">{{ formattedTime }}</div>
    </div>

    <!-- 用户头像 -->
    <div v-if="isUser" class="avatar">
      <span class="avatar-emoji">👤</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const isUser = computed(() => props.message.role === 'user')
const actionSuccess = computed(() => props.message.actionSuccess)
const formattedTime = computed(() => {
  const timestamp = props.message.timestamp
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})
</script>

<style scoped>
.chat-bubble {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  align-items: flex-end;
}

.chat-bubble.user {
  justify-content: flex-end;
}

.chat-bubble.assistant {
  justify-content: flex-start;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-bubble.assistant .avatar {
  background: linear-gradient(135deg, #8BC34A, #689F38);
}

.chat-bubble.user .avatar {
  background: #DCE8D0;
}

.avatar-emoji {
  font-size: 14px;
}

.bubble-container {
  max-width: 280px;
  display: flex;
  flex-direction: column;
}

.chat-bubble.user .bubble-container {
  align-items: flex-end;
}

.chat-bubble.assistant .bubble-container {
  align-items: flex-start;
}

.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;
}

.bubble.user {
  background: linear-gradient(135deg, #8BC34A, #558B2F);
  border-radius: 16px 4px 16px 16px;
}

.bubble.assistant {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 4px 16px 16px 16px;
}

.bubble-content {
  font-size: 14px;
  line-height: 1.5;
  color: #2C3E2E;
}

.bubble.user .bubble-content {
  color: white;
}

.timestamp {
  font-size: 10px;
  color: #AFBFAF;
  margin-top: 4px;
  padding: 0 4px;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  width: fit-content;
}

.action-chip.success {
  background: #E8F5E9;
  color: #2E7D32;
}

.action-chip:not(.success) {
  background: #FDECEC;
  color: #C62828;
}

.chip-icon {
  font-size: 11px;
}
</style>