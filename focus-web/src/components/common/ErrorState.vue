<template>
  <div class="error-state" :class="{ compact }">
    <div class="error-icon">{{ emoji }}</div>
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <button v-if="showRetry" class="error-retry-btn" @click="$emit('retry')">
      <span class="retry-icon">⟳</span>
      重试
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '出错了'
  },
  message: {
    type: String,
    default: '加载失败，请稍后重试'
  },
  emoji: {
    type: String,
    default: '😔'
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

.error-state.compact {
  padding: 32px 24px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #DC2626;
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  color: #6A7B6E;
  max-width: 280px;
  line-height: 1.5;
}

.error-retry-btn {
  margin-top: 24px;
  padding: 10px 24px;
  background: #92A681;
  color: white;
  border: none;
  border-radius: 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.error-retry-btn:hover {
  background: #7A9A6A;
  transform: translateY(-1px);
}

.retry-icon {
  font-size: 16px;
  display: inline-block;
}

.error-retry-btn:hover .retry-icon {
  animation: spin 0.5s ease;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>