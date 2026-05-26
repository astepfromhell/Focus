<template>
  <div class="personal-info-card">
    <div class="card-header">
      <span class="header-icon">🪻</span>
      <span class="header-title">个人信息</span>
      <button class="refresh-btn" :disabled="isLoading" @click="onRefresh">
        <span class="refresh-icon">⟳</span>
      </button>
    </div>

    <div v-if="isLoading" class="loading-content">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="error" class="error-content">
      <span class="error-icon">🌱</span>
      <span class="error-text">{{ error }}</span>
      <button class="retry-btn" @click="onRefresh">重试</button>
    </div>

    <div v-else-if="user" class="card-content">
      <div class="user-avatar">
        <span class="avatar-emoji">👤</span>
      </div>
      <div class="user-details">
        <div class="user-name">{{ user.username }}</div>
        <div class="user-email">{{ user.email }}</div>
        <div v-if="registeredDays > 0" class="user-registered">
          📅 已注册 {{ registeredDays }} 天
        </div>
      </div>
    </div>

    <div v-else class="empty-content">
      <span class="empty-icon">🌱</span>
      <span>未找到用户信息</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['refresh'])

const registeredDays = computed(() => {
  if (!props.user?.createdAt) return 0
  const created = new Date(props.user.createdAt)
  const now = new Date()
  const diff = now - created
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const onRefresh = () => {
  if (!props.isLoading) {
    emit('refresh')
  }
}
</script>

<style scoped>
.personal-info-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(141, 174, 155, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.header-icon {
  font-size: 18px;
}

.header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #2C3E2E;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #F3F4F6;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 18px;
}

.loading-content,
.error-content,
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: #92A681;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 32px;
}

.error-text {
  font-size: 14px;
  color: #DC2626;
}

.retry-btn {
  padding: 6px 16px;
  background: #92A681;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: white;
  cursor: pointer;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 70px;
  height: 70px;
  background: #8FBC8F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 32px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #2C3E2E;
  margin-bottom: 6px;
}

.user-email {
  font-size: 14px;
  color: #6A7B6E;
  margin-bottom: 8px;
}

.user-registered {
  font-size: 12px;
  color: #8FBC8F;
  background: rgba(143, 188, 143, 0.1);
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
}
</style>