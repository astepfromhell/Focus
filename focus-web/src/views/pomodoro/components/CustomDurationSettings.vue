<template>
  <div class="custom-settings">
    <div class="setting-item">
      <div class="setting-label">
        <span class="setting-icon">⚡</span>
        <span>专注时长</span>
      </div>
      <div class="setting-controls">
        <button class="control-btn" @click="decreaseWork" :disabled="workMinutes <= 1">
          -
        </button>
        <span class="setting-value" @click="openWorkPicker">{{ workMinutes }}</span>
        <button class="control-btn" @click="increaseWork" :disabled="workMinutes >= 180">
          +
        </button>
        <span class="setting-unit">分钟</span>
      </div>
    </div>

    <div class="setting-item">
      <div class="setting-label">
        <span class="setting-icon">☕</span>
        <span>休息时长</span>
      </div>
      <div class="setting-controls">
        <button class="control-btn" @click="decreaseBreak" :disabled="breakMinutes <= 1">
          -
        </button>
        <span class="setting-value" @click="openBreakPicker">{{ breakMinutes }}</span>
        <button class="control-btn" @click="increaseBreak" :disabled="breakMinutes >= 60">
          +
        </button>
        <span class="setting-unit">分钟</span>
      </div>
    </div>

    <!-- 专注时长选择器弹窗 -->
    <Teleport to="body">
      <div v-if="showWorkPicker" class="picker-overlay" @click.self="showWorkPicker = false">
        <div class="picker-container">
          <h3 class="picker-title">设置专注时长</h3>
          <div class="picker-wheel">
            <div class="wheel-column">
              <button
                  v-for="value in workRange"
                  :key="value"
                  class="wheel-option"
                  :class="{ selected: tempWorkMinutes === value }"
                  @click="tempWorkMinutes = value"
              >
                {{ value }}
              </button>
            </div>
            <span class="wheel-unit">分钟</span>
          </div>
          <div class="picker-actions">
            <button class="picker-cancel" @click="showWorkPicker = false">取消</button>
            <button class="picker-confirm" @click="confirmWork">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 休息时长选择器弹窗 -->
    <Teleport to="body">
      <div v-if="showBreakPicker" class="picker-overlay" @click.self="showBreakPicker = false">
        <div class="picker-container">
          <h3 class="picker-title">设置休息时长</h3>
          <div class="picker-wheel">
            <div class="wheel-column">
              <button
                  v-for="value in breakRange"
                  :key="value"
                  class="wheel-option"
                  :class="{ selected: tempBreakMinutes === value }"
                  @click="tempBreakMinutes = value"
              >
                {{ value }}
              </button>
            </div>
            <span class="wheel-unit">分钟</span>
          </div>
          <div class="picker-actions">
            <button class="picker-cancel" @click="showBreakPicker = false">取消</button>
            <button class="picker-confirm" @click="confirmBreak">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  workMinutes: {
    type: Number,
    default: 25
  },
  breakMinutes: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update-work', 'update-break'])

const showWorkPicker = ref(false)
const showBreakPicker = ref(false)
const tempWorkMinutes = ref(props.workMinutes)
const tempBreakMinutes = ref(props.breakMinutes)

const workRange = computed(() => {
  return Array.from({ length: 30 }, (_, i) => i * 5 + 5).filter(v => v <= 180)
})

const breakRange = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i * 5 + 5).filter(v => v <= 60)
})

const decreaseWork = () => {
  if (props.workMinutes > 1) {
    emit('update-work', props.workMinutes - 1)
  }
}

const increaseWork = () => {
  if (props.workMinutes < 180) {
    emit('update-work', props.workMinutes + 1)
  }
}

const decreaseBreak = () => {
  if (props.breakMinutes > 1) {
    emit('update-break', props.breakMinutes - 1)
  }
}

const increaseBreak = () => {
  if (props.breakMinutes < 60) {
    emit('update-break', props.breakMinutes + 1)
  }
}

const openWorkPicker = () => {
  tempWorkMinutes.value = props.workMinutes
  showWorkPicker.value = true
}

const openBreakPicker = () => {
  tempBreakMinutes.value = props.breakMinutes
  showBreakPicker.value = true
}

const confirmWork = () => {
  emit('update-work', tempWorkMinutes.value)
  showWorkPicker.value = false
}

const confirmBreak = () => {
  emit('update-break', tempBreakMinutes.value)
  showBreakPicker.value = false
}
</script>

<style scoped>
.custom-settings {
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.setting-item:first-child {
  border-bottom: 1px solid #F3F4F6;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #8B9980;
}

.setting-icon {
  font-size: 20px;
}

.setting-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #E5E7EB;
  background: white;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #F3F4F6;
  border-color: #92A681;
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.setting-value {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A2E;
  min-width: 50px;
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.setting-value:hover {
  background: #F3F4F6;
}

.setting-unit {
  font-size: 14px;
  color: #6B7280;
}

.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.picker-container {
  background: white;
  border-radius: 24px;
  padding: 24px;
  width: 280px;
  text-align: center;
}

.picker-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 20px;
}

.picker-wheel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.wheel-column {
  height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  background: #F9FAFB;
}

.wheel-column::-webkit-scrollbar {
  width: 4px;
}

.wheel-option {
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.wheel-option.selected {
  background: #92A681;
  color: white;
}

.wheel-unit {
  font-size: 16px;
  color: #6B7280;
}

.picker-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.picker-cancel,
.picker-confirm {
  padding: 8px 20px;
  border-radius: 24px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.picker-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.picker-confirm {
  background: #92A681;
  color: white;
}
</style>