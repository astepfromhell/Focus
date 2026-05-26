<template>
  <div class="calendar-view">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else class="calendar-container">
      <!-- 日历头部 -->
      <div class="calendar-header">
        <button class="nav-btn" @click="onPrevMonth">‹</button>
        <div class="month-info">
          <span class="month-year">{{ yearMonth }}</span>
          <button class="today-btn" @click="onToday">今天</button>
        </div>
        <button class="nav-btn" @click="onNextMonth">›</button>
      </div>

      <!-- 星期标题 -->
      <div class="weekday-header">
        <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
      </div>

      <!-- 日历网格 -->
      <div class="calendar-grid">
        <CalendarDayCell
            v-for="dayInfo in calendarDays"
            :key="dayInfo.date"
            :day-info="dayInfo"
            :tasks="getTasksForDate(dayInfo.date)"
            :is-selected="selectedDate === dayInfo.date"
            @click="() => onDateClick(dayInfo.date)"
        />
      </div>

      <!-- 图例 -->
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot long"></span>
          <span>长任务/项目</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot short"></span>
          <span>短任务</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import CalendarDayCell from './components/CalendarGrid.vue'

const props = defineProps({
  yearMonth: {
    type: String,
    required: true
  },
  tasksMap: {
    type: Map,
    default: () => new Map()
  },
  selectedDate: {
    type: String,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['prev-month', 'next-month', 'today', 'date-click'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 格式化年月显示
const yearMonth = computed(() => {
  const [year, month] = props.yearMonth.split('-')
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return `${year}年 ${monthNames[parseInt(month) - 1]}`
})

// 生成日历网格数据
const calendarDays = computed(() => {
  const [year, month] = props.yearMonth.split('-').map(Number)
  const firstDayOfMonth = dayjs(`${year}-${month}-01`)
  const daysInMonth = firstDayOfMonth.daysInMonth()
  const startDayOfWeek = firstDayOfMonth.day() // 0-6, 0=周日

  // 获取上个月的最后几天
  const prevMonthDays = []
  const prevMonth = firstDayOfMonth.subtract(1, 'month')
  const daysInPrevMonth = prevMonth.daysInMonth()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonth.date(daysInPrevMonth - i)
    prevMonthDays.push({
      date: date.format('YYYY-MM-DD'),
      isCurrentMonth: false
    })
  }

  // 当月天数
  const currentMonthDays = []
  for (let i = 1; i <= daysInMonth; i++) {
    const date = firstDayOfMonth.date(i)
    currentMonthDays.push({
      date: date.format('YYYY-MM-DD'),
      isCurrentMonth: true
    })
  }

  // 下个月的前几天（补齐6行）
  const totalDays = prevMonthDays.length + currentMonthDays.length
  const remainingDays = 42 - totalDays // 6行 x 7列 = 42
  const nextMonthDays = []
  const nextMonth = firstDayOfMonth.add(1, 'month')
  for (let i = 1; i <= remainingDays; i++) {
    const date = nextMonth.date(i)
    nextMonthDays.push({
      date: date.format('YYYY-MM-DD'),
      isCurrentMonth: false
    })
  }

  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
})

// 获取某天的任务
const getTasksForDate = (date) => {
  return props.tasksMap.get(date) || []
}

const onPrevMonth = () => {
  emit('prev-month')
}

const onNextMonth = () => {
  emit('next-month')
}

const onToday = () => {
  emit('today')
}

const onDateClick = (date) => {
  emit('date-click', date)
}
</script>

<style scoped>
.calendar-view {
  padding-bottom: 20px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.calendar-container {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F3F4F6;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.nav-btn:hover {
  background: #E5E7EB;
}

.month-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.month-year {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A2E;
}

.today-btn {
  padding: 6px 16px;
  background: #92A681;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
}

.today-btn:hover {
  background: #7A9A6A;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
}

.weekday {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 20px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6B7280;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.long {
  background: #8B5CF6;
}

.legend-dot.short {
  background: #659889;
}
</style>