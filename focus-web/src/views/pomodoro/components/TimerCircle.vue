<template>
  <div class="timer-circle">
    <svg class="progress-ring" viewBox="0 0 120 120">
      <!-- 背景圆环 -->
      <circle
          class="progress-ring-bg"
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#E5E7EB"
          stroke-width="8"
      />
      <!-- 进度圆环 -->
      <circle
          class="progress-ring-fill"
          cx="60"
          cy="60"
          r="54"
          fill="none"
          :stroke="progressColor"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          transform="rotate(-90 60 60)"
      />
    </svg>

    <div class="timer-content">
      <div class="timer-time">{{ displayTime }}</div>
      <div class="timer-status">{{ statusText }}</div>
      <div class="timer-mode" :style="{ color: progressColor }">
        {{ currentMode === 'WORK' ? '⚡ 工作模式' : '☕ 休息模式' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  displayTime: {
    type: String,
    required: true
  },
  statusText: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  currentMode: {
    type: String,
    default: 'WORK'
  }
})

const circumference = 2 * Math.PI * 54 // 约 339.292

const strokeDashoffset = computed(() => {
  const offset = circumference * (1 - props.progress / 100)
  return Math.max(0, Math.min(circumference, offset))
})

const progressColor = computed(() => {
  return props.currentMode === 'WORK' ? '#FF6B6B' : '#4ECDC4'
})
</script>

<style scoped>
.timer-circle {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.3s ease;
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-time {
  font-size: 52px;
  font-weight: 700;
  color: #1A1A2E;
  letter-spacing: 2px;
}

.timer-status {
  font-size: 16px;
  color: #6B7280;
  margin-top: 8px;
}

.timer-mode {
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}
</style>