<template>
  <div class="pomodoro-page">
    <AppHeader title="番茄钟" emoji="🍅" show-back @back="$router.back()" />

    <div class="pomodoro-container">
      <!-- 计时器圆环 -->
      <TimerCircle
          :display-time="displayTime"
          :status-text="statusText"
          :progress="progress"
          :current-mode="currentMode"
      />

      <!-- 控制按钮 -->
      <ControlButtons
          :is-running="isRunning"
          :is-paused="isPaused"
          @start="handleStart"
          @pause="handlePause"
          @reset="handleReset"
          @skip="handleSkip"
      />

      <!-- 模式选择器 -->
      <ModeSelector
          :selected-preset="selectedPreset"
          :custom-work-minutes="customWorkMinutes"
          :custom-break-minutes="customBreakMinutes"
          :is-timer-running="isRunning || isPaused"
          @select-preset="handleSelectPreset"
      />

      <!-- 自定义时长设置（仅自定义模式显示） -->
      <CustomDurationSettings
          v-if="selectedPreset === 'CUSTOM'"
          :work-minutes="customWorkMinutes"
          :break-minutes="customBreakMinutes"
          @update-work="handleUpdateWorkMinutes"
          @update-break="handleUpdateBreakMinutes"
      />

      <!-- 统计卡片 -->
      <StatsCards
          :completed-sessions="completedSessions"
          :total-focus-minutes="totalFocusMinutes"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoro'
import AppHeader from '@/components/layout/AppHeader.vue'
import TimerCircle from './components/TimerCircle.vue'
import ControlButtons from './components/ControlButtons.vue'
import ModeSelector from './components/ModeSelector.vue'
import CustomDurationSettings from './components/CustomDurationSettings.vue'
import StatsCards from './components/StatsCards.vue'

const pomodoroStore = usePomodoroStore()

// 从 store 获取状态
const isRunning = computed(() => pomodoroStore.isRunning)
const isPaused = computed(() => pomodoroStore.isPaused)
const currentMode = computed(() => pomodoroStore.currentMode)
const timeLeftSeconds = computed(() => pomodoroStore.timeLeftSeconds)
const workDurationSeconds = computed(() => pomodoroStore.workDurationSeconds)
const breakDurationSeconds = computed(() => pomodoroStore.breakDurationSeconds)
const completedSessions = computed(() => pomodoroStore.completedSessions)
const totalFocusMinutes = computed(() => pomodoroStore.totalFocusMinutes)
const selectedPreset = computed(() => pomodoroStore.selectedPreset)
const customWorkMinutes = computed(() => pomodoroStore.customWorkMinutes)
const customBreakMinutes = computed(() => pomodoroStore.customBreakMinutes)

// 计算属性
const displayTime = computed(() => pomodoroStore.displayTime)
const statusText = computed(() => pomodoroStore.statusText)
const progress = computed(() => pomodoroStore.progress)

// 操作方法
const handleStart = () => {
  pomodoroStore.start()
}

const handlePause = () => {
  pomodoroStore.pause()
}

const handleReset = () => {
  pomodoroStore.reset()
}

const handleSkip = () => {
  pomodoroStore.skip()
}

const handleSelectPreset = (preset) => {
  pomodoroStore.selectPreset(preset)
}

const handleUpdateWorkMinutes = (minutes) => {
  pomodoroStore.updateWorkDuration(minutes)
}

const handleUpdateBreakMinutes = (minutes) => {
  pomodoroStore.updateBreakDuration(minutes)
}

// 初始化
onMounted(() => {
  // 从 localStorage 加载设置
  const savedWork = localStorage.getItem('pomodoro_work_minutes')
  const savedBreak = localStorage.getItem('pomodoro_break_minutes')
  if (savedWork) pomodoroStore.updateWorkDuration(parseInt(savedWork))
  if (savedBreak) pomodoroStore.updateBreakDuration(parseInt(savedBreak))
})

// 清理定时器
onUnmounted(() => {
  pomodoroStore.cleanup()
})
</script>

<style scoped>
.pomodoro-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding-bottom: 80px;
}

.pomodoro-container {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
</style>