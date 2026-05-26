<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-icon">🪴</div>
      <div class="stat-info">
        <div class="stat-label">今日完成</div>
        <div class="stat-value">{{ completedSessions }} <span class="stat-unit">个</span></div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">📜</div>
      <div class="stat-info">
        <div class="stat-label">专注时长</div>
        <div class="stat-value">{{ formattedMinutes }} <span class="stat-unit">分钟</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completedSessions: {
    type: Number,
    default: 0
  },
  totalFocusMinutes: {
    type: Number,
    default: 0
  }
})

const formattedMinutes = computed(() => {
  const minutes = props.totalFocusMinutes
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours}`
    return `${hours}.${Math.floor(mins / 6)}`
  }
  return minutes.toString()
})
</script>

<style scoped>
.stats-cards {
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  font-size: 36px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A2E;
}

.stat-unit {
  font-size: 14px;
  font-weight: 400;
  color: #9CA3AF;
}
</style>