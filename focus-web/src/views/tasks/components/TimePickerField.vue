<template>
  <div class="time-picker-field">
    <div class="time-input" @click="showPicker = true">
      <span class="time-value">{{ displayValue }}</span>
      <span class="time-icon">⏰</span>
    </div>

    <Teleport to="body">
      <div v-if="showPicker" class="picker-overlay" @click.self="showPicker = false">
        <div class="picker-container">
          <div class="picker-header">
            <span class="picker-title">选择时间</span>
            <button class="picker-close" @click="showPicker = false">✕</button>
          </div>

          <div class="picker-body">
            <!-- 小时选择器 -->
            <div class="time-column">
              <div class="column-label">小时</div>
              <div class="column-list">
                <button
                    v-for="hour in hours"
                    :key="hour"
                    class="time-option"
                    :class="{ selected: tempHour === hour }"
                    @click="tempHour = hour"
                >
                  {{ hour.toString().padStart(2, '0') }}
                </button>
              </div>
            </div>

            <div class="time-column">
              <div class="column-label">分钟</div>
              <div class="column-list">
                <button
                    v-for="minute in minutes"
                    :key="minute"
                    class="time-option"
                    :class="{ selected: tempMinute === minute }"
                    @click="tempMinute = minute"
                >
                  {{ minute.toString().padStart(2, '0') }}
                </button>
              </div>
            </div>
          </div>

          <div class="picker-footer">
            <button class="picker-cancel" @click="showPicker = false">取消</button>
            <button class="picker-confirm" @click="confirmTime">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)

// 生成小时选项 (0-23)
const hours = computed(() => {
  return Array.from({ length: 24 }, (_, i) => i)
})

// 生成分钟选项 (0-59)
const minutes = computed(() => {
  return Array.from({ length: 60 }, (_, i) => i)
})

// 临时选中的值
const tempHour = ref(parseInt(props.modelValue?.split(':')[0] || '9'))
const tempMinute = ref(parseInt(props.modelValue?.split(':')[1] || '0'))

// 显示值
const displayValue = computed(() => {
  if (!props.modelValue) return '请选择时间'
  return props.modelValue
})

// 确认时间
const confirmTime = () => {
  const timeStr = `${tempHour.value.toString().padStart(2, '0')}:${tempMinute.value.toString().padStart(2, '0')}`
  emit('update:modelValue', timeStr)
  showPicker.value = false
}

// 重置临时值（当打开选择器时）
const resetTempValues = () => {
  if (props.modelValue) {
    const parts = props.modelValue.split(':')
    tempHour.value = parseInt(parts[0]) || 9
    tempMinute.value = parseInt(parts[1]) || 0
  } else {
    tempHour.value = 9
    tempMinute.value = 0
  }
}

// 监听显示状态，重置临时值
const handleShowPicker = () => {
  if (showPicker.value) {
    resetTempValues()
  }
}

// 使用 watch 替代 beforeUpdate
import { watch } from 'vue'
watch(showPicker, (newVal) => {
  if (newVal) {
    resetTempValues()
  }
})
</script>

<style scoped>
.time-picker-field {
  width: 100%;
}

.time-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-input:hover {
  border-color: #92A681;
}

.time-value {
  font-size: 14px;
  color: #1A1A2E;
}

.time-icon {
  font-size: 16px;
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
  border-radius: 20px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.picker-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
}

.picker-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #F3F4F6;
  cursor: pointer;
  font-size: 14px;
}

.picker-body {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

.time-column {
  text-align: center;
}

.column-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
}

.column-list {
  height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
  border-radius: 12px;
  background: #F9FAFB;
}

.column-list::-webkit-scrollbar {
  width: 4px;
}

.column-list::-webkit-scrollbar-track {
  background: #E5E7EB;
  border-radius: 2px;
}

.column-list::-webkit-scrollbar-thumb {
  background: #92A681;
  border-radius: 2px;
}

.time-option {
  width: 60px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-option:hover {
  background: #E5E7EB;
}

.time-option.selected {
  background: #92A681;
  color: white;
}

.picker-footer {
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