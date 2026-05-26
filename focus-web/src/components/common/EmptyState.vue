<template>
  <div class="empty-state" :class="{ compact }">
    <div class="empty-icon">{{ emoji }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <button v-if="actionText" class="empty-action" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  emoji: {
    type: String,
    default: '🌱'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

.empty-state.compact {
  padding: 32px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E2E;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #6A7B6E;
  max-width: 280px;
  line-height: 1.5;
}

.empty-action {
  margin-top: 24px;
  padding: 10px 24px;
  background: #92A681;
  color: white;
  border: none;
  border-radius: 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-action:hover {
  background: #7A9A6A;
  transform: translateY(-1px);
}
</style>