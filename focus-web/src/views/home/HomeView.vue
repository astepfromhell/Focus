<template>
  <div class="home-page">
    <AppContainer>
      <!-- 顶部欢迎区域 -->
      <div class="welcome-section">
        <div class="logo-area">
          <img src="/favicon.ico" alt="Focus" class="logo-icon" />
        </div>
        <h1 class="welcome-title">心流森境</h1>
        <p class="welcome-subtitle">欢迎回来，开启你的专注时光</p>
      </div>

      <!-- 功能卡片网格（三列并排） -->
      <div class="cards-grid">
        <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
            :style="{ background: feature.backgroundColor }"
            @click="feature.onClick"
        >
          <div class="card-content">
            <div class="card-emoji">{{ feature.emoji }}</div>
            <h2 class="card-title">{{ feature.title }}</h2>
            <p class="card-description">{{ feature.description }}</p>
            <div class="card-action">
              <span class="action-text">点击进入 →</span>
            </div>
          </div>
        </div>
      </div>
    </AppContainer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppContainer from '@/components/layout/AppContainer.vue'

const router = useRouter()

const features = [
  {
    emoji: '🍅',
    title: '番茄钟',
    description: '专注工作，高效管理时间\n25分钟专注，5分钟休息',
    backgroundColor: '#FFEBEE',
    onClick: () => router.push('/pomodoro')
  },
  {
    emoji: '📜',
    title: '日程',
    description: '计划你的一天\n轻松管理任务和待办事项',
    backgroundColor: '#FFF3E0',
    onClick: () => router.push('/tasks')
  },
  {
    emoji: '🌿',
    title: '便签',
    description: '记录灵感瞬间\n随时随地捕捉你的想法',
    backgroundColor: '#E8F5E9',
    onClick: () => router.push('/notes')
  }
]
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.welcome-section {
  text-align: center;
  padding: 20px 0 10px;
}

.logo-area {
  margin-bottom: 8px;
}

.logo-icon {
  width: 80px;
  height: 80px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #526E54;
  margin-bottom: 6px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #757575;
}

/* 三列网格布局 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px 16px;
  max-width: 900px;
  margin: 0 auto;
}

/* 响应式：小屏幕时改为上下排列 */
@media (max-width: 700px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 350px;
  }
}

.feature-card {
  border-radius: 32px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 20px;
}

.card-emoji {
  font-size: 64px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #2E2E2E;
  margin-bottom: 12px;
}

.card-description {
  font-size: 13px;
  color: #616161;
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 24px;
}

.card-action {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 40px;
  display: inline-block;
  backdrop-filter: blur(4px);
}

.action-text {
  font-size: 13px;
  font-weight: 500;
  color: #526E54;
}
</style>