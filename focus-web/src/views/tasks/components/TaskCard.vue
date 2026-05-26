<template>
  <div class="task-card" :class="{ completed: task.isCompleted }">
    <div class="card-main">
      <div class="checkbox-area">
        <button class="checkbox" :class="{ checked: task.isCompleted }" @click="onToggleComplete">
          <span v-if="task.isCompleted" class="check-mark">✓</span>
        </button>
      </div>

      <div class="task-content" @click="onEdit">
        <h4 class="task-title">{{ task.title }}</h4>
        <p v-if="task.description" class="task-description">{{ task.description }}</p>
        <div class="task-meta">
          <span v-if="timeRange" class="meta-time">{{ timeRange }}</span>
          <span v-if="task.tags" class="meta-tag">{{ task.tags }}</span>
          <span v-if="task.reminder" class="meta-reminder">🔔</span>
        </div>
      </div>

      <div class="action-area">
        <button class="action-btn" @click.stop="onEdit">✏️</button>
        <button class="action-btn delete" @click.stop="onDelete">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-complete'])

// 时间范围显示
const timeRange = computed(() => {
  const start = props.task.startTime || ''
  const end = props.task.endTime || ''
  if (start && end) return `${start} - ${end}`
  if (start) return `${start} 开始`
  if (end) return `截止 ${end}`
  return ''
})

const onEdit = () => {
  emit('edit')
}

const onDelete = () => {
  emit('delete')
}

const onToggleComplete = () => {
  emit('toggle-complete')
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.task-card.completed {
  opacity: 0.6;
}

.card-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.checkbox-area {
  flex-shrink: 0;
}

.checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #D1D5DB;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background: #92A681;
  border-color: #92A681;
}

.check-mark {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.task-description {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.meta-time {
  font-size: 12px;
  padding: 2px 8px;
  background: #F3F4F6;
  border-radius: 12px;
  color: #6B7280;
}

.meta-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: #E0E7FF;
  color: #7FA29B;
  border-radius: 12px;
}

.meta-reminder {
  font-size: 12px;
}

.action-area {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: #F3F4F6;
}

.action-btn.delete:hover {
  background: #FEE2E2;
}
</style>