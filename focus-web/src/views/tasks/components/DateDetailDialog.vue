<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-container">
        <!-- 头部 -->
        <div class="dialog-header">
          <div class="header-title">
            <span class="date-text">{{ formattedDate }}</span>
            <span class="weekday-text">{{ weekday }}</span>
          </div>
          <button class="close-btn" @click="handleClose">✕</button>
        </div>

        <!-- 内容区域 -->
        <div class="dialog-body">
          <!-- 长任务区域 -->
          <div v-if="longTasks.length > 0" class="task-section">
            <div class="section-header">
              <span class="section-icon">📅</span>
              <span class="section-title">进行中的项目</span>
            </div>
            <div class="task-list">
              <div
                  v-for="task in longTasks"
                  :key="task.id"
                  class="task-item"
                  @click="handleTaskClick(task)"
              >
                <div class="task-checkbox" @click.stop="handleToggleComplete(task)">
                  <div class="checkbox" :class="{ checked: task.isCompleted }">
                    <span v-if="task.isCompleted" class="check-mark">✓</span>
                  </div>
                </div>
                <div class="task-info">
                  <span class="task-title" :class="{ completed: task.isCompleted }">
                    {{ task.title }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 短任务区域 -->
          <div class="task-section">
            <div class="section-header">
              <span class="section-icon">📋</span>
              <span class="section-title">当日任务</span>
            </div>
            <div v-if="shortTasks.length === 0" class="empty-tasks">
              暂无任务
            </div>
            <div v-else class="task-list">
              <div
                  v-for="task in shortTasks"
                  :key="task.id"
                  class="task-item"
                  @click="handleTaskClick(task)"
              >
                <div class="task-checkbox" @click.stop="handleToggleComplete(task)">
                  <div class="checkbox" :class="{ checked: task.isCompleted }">
                    <span v-if="task.isCompleted" class="check-mark">✓</span>
                  </div>
                </div>
                <div class="task-info">
                  <span v-if="task.startTime" class="task-time">{{ task.startTime }}</span>
                  <span class="task-title" :class="{ completed: task.isCompleted }">
                    {{ task.title }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="dialog-footer">
          <button class="add-btn" @click="handleAddTask">
            ➕ 添加任务
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    default: null
  },
  shortTasks: {
    type: Array,
    default: () => []
  },
  longTasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'task-click', 'toggle-complete', 'add-task'])

const formattedDate = computed(() => {
  if (!props.date) return ''
  return dayjs(props.date).format('YYYY年MM月DD日')
})

const weekday = computed(() => {
  if (!props.date) return ''
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `星期${weekdays[dayjs(props.date).day()]}`
})

const handleClose = () => {
  emit('close')
}

const handleTaskClick = (task) => {
  emit('task-click', task)
}

const handleToggleComplete = (task) => {
  emit('toggle-complete', task)
}

const handleAddTask = () => {
  emit('add-task')
}
</script>

<style scoped>
.dialog-overlay {
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
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dialogFadeIn 0.2s ease;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
  border-bottom: 1px solid #E5E7EB;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-text {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A2E;
}

.weekday-text {
  font-size: 13px;
  color: #9CA3AF;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #F3F4F6;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #E5E7EB;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.task-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #F9FAFB;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.task-item:hover {
  background: #F3F4F6;
}

.task-checkbox {
  flex-shrink: 0;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #D1D5DB;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkbox.checked {
  background: #92A681;
  border-color: #92A681;
}

.check-mark {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.task-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.task-time {
  font-size: 13px;
  font-weight: 500;
  color: #92A681;
}

.task-title {
  font-size: 14px;
  color: #1A1A2E;
}

.task-title.completed {
  text-decoration: line-through;
  color: #9CA3AF;
}

.empty-tasks {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #9CA3AF;
  background: #F9FAFB;
  border-radius: 12px;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #E5E7EB;
}

.add-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #C3E1AF, #92A681);
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(146, 166, 129, 0.3);
}
</style>