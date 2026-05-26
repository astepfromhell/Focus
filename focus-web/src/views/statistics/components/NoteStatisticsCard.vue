<template>
  <div class="note-statistics-card">
    <div class="card-header">
      <span class="card-icon">📝</span>
      <span class="card-title">便签统计</span>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-emoji">📝</div>
        <div class="stat-value">{{ noteStats.total }}</div>
        <div class="stat-label">总便签</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">🌿</div>
        <div class="stat-value">{{ noteStats.active }}</div>
        <div class="stat-label">活跃</div>
      </div>

      <div class="stat-item">
        <div class="stat-emoji">🗃️</div>
        <div class="stat-value">{{ noteStats.archived }}</div>
        <div class="stat-label">已归档</div>
      </div>
    </div>

    <div v-if="recentNotes.length > 0" class="recent-section">
      <div class="recent-header">
        <span class="recent-icon">📌</span>
        <span class="recent-title">最近便签</span>
      </div>
      <div class="recent-list">
        <div v-for="note in recentNotes" :key="note.id" class="recent-item">
          <span class="bullet">•</span>
          <span class="recent-content">{{ getPreview(note.content) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  noteStats: {
    type: Object,
    default: () => ({
      total: 0,
      active: 0,
      archived: 0,
      recent: []
    })
  }
})

const recentNotes = computed(() => {
  return props.noteStats.recent?.slice(0, 3) || []
})

const getPreview = (content) => {
  if (!content) return ''
  const preview = content.replace(/\n/g, ' ')
  return preview.length > 40 ? preview.slice(0, 40) + '...' : preview
}
</script>

<style scoped>
.note-statistics-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
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
  margin-bottom: 24px;
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

.recent-section {
  border-top: 1px solid #E5E7EB;
  padding-top: 16px;
}

.recent-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.recent-icon {
  font-size: 14px;
}

.recent-title {
  font-size: 14px;
  font-weight: 500;
  color: #6A7B6E;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6A7B6E;
}

.bullet {
  color: #8FBC8F;
  font-weight: bold;
  font-size: 16px;
}

.recent-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>