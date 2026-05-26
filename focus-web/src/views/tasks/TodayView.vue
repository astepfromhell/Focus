<template>
  <div class="today-view">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else>
      <!-- 今日头部 -->
      <div class="today-header">
        <div class="header-info">
          <h2 class="header-date">{{ formattedDate }}</h2>
          <p class="header-weekday">{{ weekday }}</p>
        </div>
        <button class="add-task-btn" @click="onAddTask">
          <span>＋</span> 新建任务
        </button>
      </div>

      <!-- 长任务区域 -->
      <div v-if="longTasks.length > 0" class="section">
        <div class="section-header">
          <span class="section-icon">🪶</span>
          <h3 class="section-title">进行中的项目</h3>
          <span class="section-count">{{ longTasks.length }}</span>
        </div>
        <div class="section-content">
          <LongTaskCard
              v-for="task in longTasks"
              :key="task.id"
              :task="task"
              @edit="() => onEditTask(task)"
              @delete="() => onDeleteTask(task)"
              @toggle-complete="() => onToggleComplete(task)"
          />
        </div>
      </div>

      <!-- 短任务区域 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">📜</span>
          <h3 class="section-title">今日任务</h3>
          <span class="section-count">{{ shortTasks.length }}</span>
        </div>
        <div class="section-content">
          <template v-if="shortTasks.length === 0">
            <EmptyTasksView @add-task="onAddTask" />
          </template>
          <template v-else>
            <TaskCard
                v-for="task in shortTasks"
                :key="task.id"
                :task="task"
                @edit="() => onEditTask(task)"
                @delete="() => onDeleteTask(task)"
                @toggle-complete="() => onToggleComplete(task)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyTasksView from './components/EmptyTasksView.vue'
import TaskCard from './components/TaskCard.vue'
import LongTaskCard from './components/LongTaskCard.vue'

const props = defineProps({
  shortTasks: {
    type: Array,
    default: () => []
  },
  longTasks: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-task', 'edit-task', 'delete-task', 'toggle-complete'])

const formattedDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日')
})

const weekday = computed(() => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `星期${weekdays[dayjs().day()]}`
})

const onAddTask = () => {
  emit('add-task')
}

const onEditTask = (task) => {
  emit('edit-task', task)
}

const onDeleteTask = (task) => {
  emit('delete-task', task)
}

const onToggleComplete = (task) => {
  emit('toggle-complete', task)
}
</script>

<style scoped>
.today-view {
  padding-bottom: 20px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.today-header {
  background: linear-gradient(135deg, #FFD0D0, #B397FD);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-date {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.header-weekday {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.add-task-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
}

.section-count {
  background: #CFD5B8;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>