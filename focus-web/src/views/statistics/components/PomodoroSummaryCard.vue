<template>
  <div class="pomodoro-summary-card">
    <div class="card-header">
      <span class="card-icon">🍅</span>
      <span class="card-title">番茄钟统计</span>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-emoji">🍅</div>
        <div class="stat-value">{{ summary.totalSessions }}</div>
        <div class="stat-label">总次数</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">✅</div>
        <div class="stat-value">{{ summary.completedSessions }}</div>
        <div class="stat-label">已完成</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">⏱️</div>
        <div class="stat-value">{{ formattedMinutes }}</div>
        <div class="stat-label">专注时长</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({
      totalSessions: 0,
      completedSessions: 0,
      totalFocusMinutes: 0
    })
  }
})

const formattedMinutes = computed(() => {
  const minutes = props.summary.totalFocusMinutes
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours}小时`
    return `${hours}小时${mins}分钟`
  }
  return `${minutes}分钟`
})
</script>

<style scoped>
.pomodoro-summary-card {
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

.stats-grid {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  flex: 1;
}

.stat-emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #8FBC8F;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  color: #6A7B6E;
}
</style>