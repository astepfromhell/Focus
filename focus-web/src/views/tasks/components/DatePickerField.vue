<template>
  <div class="date-picker-field">
    <div class="date-input" @click="showPicker = true">
      <span class="date-value">{{ displayValue }}</span>
      <span class="date-icon">📅</span>
    </div>

    <Teleport to="body">
      <div v-if="showPicker" class="picker-overlay" @click.self="showPicker = false">
        <div class="picker-container">
          <div class="picker-header">
            <button class="picker-nav" @click="changeMonth(-1)">‹</button>
            <span class="picker-month">{{ currentMonthYear }}</span>
            <button class="picker-nav" @click="changeMonth(1)">›</button>
          </div>

          <div class="picker-weekdays">
            <span v-for="day in weekdays" :key="day" class="picker-weekday">{{ day }}</span>
          </div>

          <div class="picker-days">
            <button
                v-for="day in calendarDays"
                :key="day.date"
                class="picker-day"
                :class="{
                'selected': isSelected(day.date),
                'today': isToday(day.date),
                'disabled': isDisabled(day.date)
              }"
                :disabled="isDisabled(day.date)"
                @click="selectDate(day.date)"
            >
              {{ day.day }}
            </button>
          </div>

          <div class="picker-footer">
            <button class="picker-cancel" @click="showPicker = false">取消</button>
            <button class="picker-confirm" @click="confirmDate">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  minDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const tempSelectedDate = ref(props.modelValue || dayjs().format('YYYY-MM-DD'))
const currentViewDate = ref(dayjs(props.modelValue || undefined))

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 显示值
const displayValue = computed(() => {
  if (!props.modelValue) return '请选择日期'
  return dayjs(props.modelValue).format('YYYY-MM-DD')
})

// 当前年月显示
const currentMonthYear = computed(() => {
  return currentViewDate.value.format('YYYY年MM月')
})

// 生成日历天数
const calendarDays = computed(() => {
  const firstDayOfMonth = currentViewDate.value.startOf('month')
  const daysInMonth = firstDayOfMonth.daysInMonth()
  const startDayOfWeek = firstDayOfMonth.day()

  const days = []

  // 上个月的天数
  const prevMonth = firstDayOfMonth.subtract(1, 'month')
  const daysInPrevMonth = prevMonth.daysInMonth()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.date(daysInPrevMonth - i).format('YYYY-MM-DD'),
      day: daysInPrevMonth - i,
      isCurrentMonth: false
    })
  }

  // 当月天数
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: firstDayOfMonth.date(i).format('YYYY-MM-DD'),
      day: i,
      isCurrentMonth: true
    })
  }

  // 下个月的天数（补齐6行）
  const totalDays = days.length
  const remainingDays = 42 - totalDays
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: firstDayOfMonth.add(1, 'month').date(i).format('YYYY-MM-DD'),
      day: i,
      isCurrentMonth: false
    })
  }

  return days
})

// 判断是否是今天
const isToday = (date) => {
  return date === dayjs().format('YYYY-MM-DD')
}

// 判断是否选中
const isSelected = (date) => {
  return date === tempSelectedDate.value
}

// 判断是否禁用
const isDisabled = (date) => {
  if (props.minDate) {
    return date < props.minDate
  }
  return false
}

// 选择日期
const selectDate = (date) => {
  if (!isDisabled(date)) {
    tempSelectedDate.value = date
  }
}

// 确认日期
const confirmDate = () => {
  emit('update:modelValue', tempSelectedDate.value)
  showPicker.value = false
}

// 切换月份
const changeMonth = (delta) => {
  currentViewDate.value = currentViewDate.value.add(delta, 'month')
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    tempSelectedDate.value = newVal
    currentViewDate.value = dayjs(newVal)
  }
})
</script>

<style scoped>
.date-picker-field {
  width: 100%;
}

.date-input {
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

.date-input:hover {
  border-color: #92A681;
}

.date-value {
  font-size: 14px;
  color: #1A1A2E;
}

.date-icon {
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
  width: 320px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.picker-nav {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #F3F4F6;
  font-size: 18px;
  cursor: pointer;
}

.picker-month {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
}

.picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.picker-weekday {
  font-size: 13px;
  color: #6B7280;
  padding: 8px 0;
}

.picker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.picker-day {
  aspect-ratio: 1 / 1;
  border: none;
  background: transparent;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-day:hover:not(:disabled) {
  background: #F3F4F6;
}

.picker-day.selected {
  background: #92A681;
  color: white;
}

.picker-day.today {
  font-weight: bold;
  color: #92A681;
}

.picker-day.disabled {
  opacity: 0.3;
  cursor: not-allowed;
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