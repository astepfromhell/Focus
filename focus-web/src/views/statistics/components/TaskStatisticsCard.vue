<template>
  <div class="task-statistics-card">
    <div class="card-header">
      <span class="card-icon">📋</span>
      <span class="card-title">任务统计</span>
    </div>

    <!-- 完成率进度条 -->
    <div class="completion-section">
      <div class="completion-header">
        <span class="completion-label">🌟 完成率</span>
        <span class="completion-value">{{ completionRate }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: completionRate + '%' }"></div>
      </div>
      <div class="progress-icon">🌱</div>
    </div>

    <!-- 任务状态分布 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-emoji">📋</div>
        <div class="stat-value">{{ taskStats.total }}</div>
        <div class="stat-label">总任务</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">🌱</div>
        <div class="stat-value">{{ taskStats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">✨</div>
        <div class="stat-value">{{ taskStats.inProgress }}</div>
        <div class="stat-label">进行中</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">⏳</div>
        <div class="stat-value">{{ taskStats.todo }}</div>
        <div class="stat-label">待开始</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">⚠️</div>
        <div class="stat-value">{{ taskStats.overdue }}</div>
        <div class="stat-label">已逾期</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  taskStats: {
    type: Object,
    default: () => ({
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      overdue: 0,
      completionRate: 0
    })
  }
})

const completionRate = computed(() => {
  if (props.taskStats.total === 0) return 0
  return Math.round((props.taskStats.completed / props.taskStats.total) * 100)
})
</script>

<style scoped>
.task-statistics-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 18px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E2E;
}

.completion-section {
  margin-bottom: 24px;
  position: relative;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.completion-label {
  font-size: 14px;
  font-weight: 500;
  color: #6A7B6E;
}

.completion-value {
  font-size: 16px;
  font-weight: 700;
  color: #8FBC8F;
}

.progress-bar {
  height: 10px;
  background: #C6D8C3;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A8D5BA, #8FBC8F);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-icon {
  position: absolute;
  right: 0;
  bottom: -8px;
  font-size: 16px;
  opacity: 0.6;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}

.stat-item {
  flex: 1;
  min-width: 70px;
  text-align: center;
}

.stat-emoji {
  font-size: 24px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #8FBC8F;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6A7B6E;
}
</style>