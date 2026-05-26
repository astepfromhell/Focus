<template>
  <div class="mode-selector">
    <div class="selector-header">
      <span class="selector-title">番茄钟模式</span>
      <span v-if="isTimerRunning" class="selector-hint">（专注中不可切换）</span>
    </div>

    <div class="mode-list">
      <button
          v-for="preset in presets"
          :key="preset.id"
          class="mode-card"
          :class="{
          active: selectedPreset === preset.id,
          disabled: isTimerRunning
        }"
          :disabled="isTimerRunning"
          @click="onSelectPreset(preset.id)"
      >
        <div class="mode-icon">{{ preset.icon }}</div>
        <div class="mode-name">{{ preset.name }}</div>
        <div class="mode-duration">
          {{ getWorkMinutes(preset.id) }}分钟 + {{ getBreakMinutes(preset.id) }}分钟
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { POMODORO_PRESETS } from '@/utils/constants'

const props = defineProps({
  selectedPreset: {
    type: String,
    default: 'CLASSIC'
  },
  customWorkMinutes: {
    type: Number,
    default: 25
  },
  customBreakMinutes: {
    type: Number,
    default: 5
  },
  isTimerRunning: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-preset'])

const presets = computed(() => Object.values(POMODORO_PRESETS))

const getWorkMinutes = (presetId) => {
  if (presetId === 'CUSTOM') return props.customWorkMinutes
  return POMODORO_PRESETS[presetId]?.work || 25
}

const getBreakMinutes = (presetId) => {
  if (presetId === 'CUSTOM') return props.customBreakMinutes
  return POMODORO_PRESETS[presetId]?.break || 5
}

const onSelectPreset = (presetId) => {
  if (!props.isTimerRunning) {
    emit('select-preset', presetId)
  }
}
</script>

<style scoped>
.mode-selector {
  width: 100%;
  margin: 16px 0;
}

.selector-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.selector-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
}

.selector-hint {
  font-size: 12px;
  color: #9CA3AF;
}

.mode-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.mode-card {
  flex: 1;
  min-width: 100px;
  padding: 16px 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-card.active {
  background: linear-gradient(135deg, #FFD0D0, #B397FD);
  border-color: transparent;
}

.mode-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-card:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mode-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.mode-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.mode-card.active .mode-name {
  color: white;
}

.mode-duration {
  font-size: 11px;
  color: #6B7280;
}

.mode-card.active .mode-duration {
  color: rgba(255, 255, 255, 0.9);
}
</style>