<template>
  <div class="message-input-container">
    <div class="input-wrapper">
      <!-- 麦克风按钮 -->
      <VoiceInputButton
          :voice-state="voiceState"
          @start="onStartVoice"
          @stop="onStopVoice"
      />

      <!-- 输入框 -->
      <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          class="message-input"
          :class="{ offline: isOffline, listening: isListening }"
          :placeholder="placeholderText"
          :disabled="isLoading || isOffline"
          @keydown.enter="handleSend"
      />

      <!-- 发送按钮 -->
      <button
          v-if="canSend"
          class="send-btn"
          @click="handleSend"
      >
        <span class="send-icon">📤</span>
      </button>
      <div v-else-if="isOffline" class="offline-icon">📡</div>
      <div v-else class="send-placeholder"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import VoiceInputButton from './VoiceInputButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isOffline: {
    type: Boolean,
    default: false
  },
  voiceState: {
    type: String,
    default: 'idle'
  }
})

const emit = defineEmits(['update:modelValue', 'send', 'start-voice', 'stop-voice'])

const inputRef = ref(null)
const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isListening = computed(() => props.voiceState === 'listening')
const canSend = computed(() => {
  return inputValue.value && inputValue.value.trim().length > 0 && !props.isLoading && !props.isOffline
})

const placeholderText = computed(() => {
  if (props.isOffline) return '无网络，无法发送...'
  if (isListening.value) return '正在聆听...'
  return '输入消息...'
})

const handleSend = () => {
  if (canSend.value) {
    emit('send')
  }
}

const onStartVoice = () => {
  emit('start-voice')
}

const onStopVoice = () => {
  emit('stop-voice')
}

const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

defineExpose({ focusInput })
</script>

<style scoped>
.message-input-container {
  position: fixed;
  bottom: 80px;  /* 改为 80px，给底部导航栏留出空间 */
  left: 0;
  right: 0;
  background: #E5EDD4;
  padding: 12px 16px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
  z-index: 50;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #CFDEC4;
  border-radius: 28px;
  font-size: 15px;
  background: white;
  outline: none;
  transition: all 0.2s ease;
}

.message-input:focus {
  border-color: #8BC34A;
  box-shadow: 0 0 0 2px rgba(139, 195, 74, 0.2);
}

.message-input.offline {
  border-color: #DBA96A;
  background: #FFF8F0;
}

.message-input.listening {
  border-color: #66BB6A;
  animation: pulseBorder 1s ease-in-out infinite;
}

.message-input:disabled {
  background: #F5F5F5;
  color: #9CA3AF;
}

@keyframes pulseBorder {
  0%, 100% {
    border-color: #66BB6A;
  }
  50% {
    border-color: #A5D6A7;
  }
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8BC34A, #558B2F);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-icon {
  font-size: 20px;
}

.send-placeholder {
  width: 48px;
  height: 48px;
}

.offline-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FFF3CD;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: not-allowed;
}
</style>