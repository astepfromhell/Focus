<template>
  <div
      class="calendar-cell"
      :class="{
      'current-month': dayInfo.isCurrentMonth,
      'other-month': !dayInfo.isCurrentMonth,
      'today': isToday,
      'selected': isSelected,
      'has-tasks': hasTasks
    }"
      @click="handleClick"
  >
    <div class="cell-content">
      <span class="day-number">{{ dayNumber }}</span>
      <div v-if="hasTasks && dayInfo.isCurrentMonth" class="task-indicators">
        <span v-if="longTaskCount > 0" class="indicator long"></span>
        <span v-if="shortTaskCount > 0" class="indicator short"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { TASK_TYPE } from '@/utils/constants'

const props = defineProps({
  dayInfo: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

// 日期数字
const dayNumber = computed(() => {
  return dayjs(props.dayInfo.date).date()
})

// 是否是今天
const isToday = computed(() => {
  return props.dayInfo.date === dayjs().format('YYYY-MM-DD')
})

// 任务统计
const shortTaskCount = computed(() => {
  return props.tasks.filter(t => t.type === TASK_TYPE.SHORT).length
})

const longTaskCount = computed(() => {
  return props.tasks.filter(t => t.type === TASK_TYPE.LONG).length
})

const hasTasks = computed(() => {
  return shortTaskCount.value > 0 || longTaskCount.value > 0
})

const handleClick = () => {
  if (props.dayInfo.isCurrentMonth) {
    emit('click')
  }
}
</script>

<style scoped>
.calendar-cell {
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #F9FAFB;
}

.calendar-cell.current-month {
  background: #FFFFFF;
}

.calendar-cell.other-month {
  opacity: 0.4;
}

.calendar-cell.today {
  background: #BED6BC;
}

.calendar-cell.selected {
  outline: 2px solid #92A681;
  outline-offset: -2px;
}

.calendar-cell:hover:not(.other-month) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cell-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A2E;
}

.calendar-cell.today .day-number {
  color: white;
  background: #A4C1A6;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.task-indicators {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.indicator.long {
  background: #8B5CF6;
}

.indicator.short {
  background: #659889;
}
</style>