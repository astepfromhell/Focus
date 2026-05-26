<template>
  <button
      class="voice-btn"
      :class="{
      listening: isListening,
      recognizing: isRecognizing,
      error: isError
    }"
      @click="handleClick"
      :disabled="isRecognizing"
  >
    <span v-if="isError" class="voice-icon">🎤❌</span>
    <span v-else-if="isListening" class="voice-icon mic-animate">🎤</span>
    <span v-else-if="isRecognizing" class="voice-icon">🤔</span>
    <span v-else class="voice-icon">🎤</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  voiceState: {
    type: String,
    default: 'idle' // idle, listening, recognizing, error
  }
})

const emit = defineEmits(['start', 'stop'])

const isListening = computed(() => props.voiceState === 'listening')
const isRecognizing = computed(() => props.voiceState === 'recognizing')
const isError = computed(() => props.voiceState === 'error')

const handleClick = () => {
  if (isListening.value) {
    emit('stop')
  } else if (!isRecognizing.value) {
    emit('start')
  }
}
</script>

<style scoped>
.voice-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #8BC34A, #558B2F);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.voice-btn.listening {
  background: linear-gradient(135deg, #66BB6A, #2E7D32);
  animation: pulse 0.8s ease-in-out infinite;
}

.voice-btn.recognizing {
  background: linear-gradient(135deg, #29B6F6, #0277BD);
}

.voice-btn.error {
  background: linear-gradient(135deg, #BDBDBD, #9E9E9E);
}

.voice-icon {
  font-size: 22px;
}

.mic-animate {
  animation: micWave 1s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(102, 187, 106, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

@keyframes micWave {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>