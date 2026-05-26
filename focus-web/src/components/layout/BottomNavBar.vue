<template>
  <div class="bottom-nav">
    <div class="nav-container">
      <!-- 左侧：心流 -->
      <div
          class="nav-item"
          :class="{ active: currentRoute === 'home' }"
          @click="navigateTo('home')"
      >
        <div class="nav-icon">
          <span class="emoji">🌿</span>
        </div>
        <span class="nav-label">心流</span>
      </div>

      <!-- 中间占位（给浮动按钮留空间） -->
      <div class="nav-placeholder"></div>

      <!-- 右侧：我的 -->
      <div
          class="nav-item"
          :class="{ active: currentRoute === 'profile' }"
          @click="navigateTo('profile')"
      >
        <div class="nav-icon">
          <span class="emoji">👤</span>
        </div>
        <span class="nav-label">我的</span>
      </div>
    </div>

    <!-- 中间浮动按钮 -->
    <div class="fab-container" @click="onAssistantClick" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <div class="fab-button">
        <span class="fab-emoji">🤖</span>
      </div>
      <span class="fab-label" :class="{ active: currentRoute === 'assistant' }">助手</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 当前路由名称
const currentRoute = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path === '/home') return 'home'
  if (path === '/assistant') return 'assistant'
  if (path === '/profile') return 'profile'
  return ''
})

// 长按检测
let pressTimer = null
const LONG_PRESS_DURATION = 500

const emit = defineEmits(['assistantLongPress'])

const onTouchStart = () => {
  pressTimer = setTimeout(() => {
    emit('assistantLongPress')
  }, LONG_PRESS_DURATION)
}

const onTouchEnd = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

const onAssistantClick = () => {
  if (currentRoute.value !== 'assistant') {
    router.push('/assistant')
  }
}

const navigateTo = (page) => {
  if (currentRoute.value === page) return
  router.push(`/${page}`)
}

onUnmounted(() => {
  if (pressTimer) {
    clearTimeout(pressTimer)
  }
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #E5EDD4;
  border-radius: 24px 24px 0 0;
  padding: 12px 48px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
}

.nav-placeholder {
  flex: 1;
}

.nav-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji {
  font-size: 24px;
}

.nav-label {
  font-size: 12px;
  color: #9CA3AF;
  transition: color 0.2s ease;
}

.nav-item.active .nav-label {
  color: #5A8A4A;
  font-weight: 600;
}

/* 浮动按钮容器 */
.fab-container {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.fab-button {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #8BC34A, #689F38);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-emoji {
  font-size: 32px;
}

.fab-label {
  font-size: 11px;
  color: #9E9E9E;
}

.fab-label.active {
  color: #5A8A4A;
  font-weight: 600;
}
</style>