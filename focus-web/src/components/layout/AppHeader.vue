<template>
  <header class="app-header" :class="{ 'with-back': showBack }">
    <div class="header-left">
      <button v-if="showBack" class="back-btn" @click="handleBack">
        <span class="back-icon">←</span>
      </button>
    </div>

    <div class="header-title">
      <slot name="title">
        <span class="title-emoji">{{ emoji }}</span>
        <span class="title-text">{{ title }}</span>
      </slot>
    </div>

    <div class="header-right">
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '心流森境'
  },
  emoji: {
    type: String,
    default: '🌱'
  },
  showBack: {
    type: Boolean,
    default: false
  },
  backPath: {
    type: String,
    default: null
  }
})

const router = useRouter()
const emit = defineEmits(['back'])

const handleBack = () => {
  if (props.backPath) {
    router.push(props.backPath)
  } else {
    emit('back')
    router.back()
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  width: 48px;
  display: flex;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.back-icon {
  font-size: 24px;
  color: #7A9A6A;
}

.header-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  color: #2C3E2E;
}

.title-emoji {
  font-size: 20px;
}

.title-text {
  font-size: 18px;
}

.header-right {
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>