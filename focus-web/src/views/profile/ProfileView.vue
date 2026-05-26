<template>
  <div class="profile-page">
    <AppHeader title="我的" emoji="👤" />

    <div class="profile-container">
      <!-- 个人信息卡片 -->
      <PersonalInfoCard
          :user="user"
          :is-loading="isLoadingUser"
          :error="userError"
          @refresh="refreshUserInfo"
      />

      <!-- 统计入口 -->
      <NaturalButton
          emoji="🌾"
          text="统计"
          variant="outline"
          @click="goToStatistics"
      />

      <!-- 设置入口 -->
      <NaturalButton
          emoji="☘️"
          text="设置"
          variant="outline"
          @click="goToSettings"
      />

      <!-- 退出登录 -->
      <div class="logout-section">
        <button class="logout-btn" @click="showLogoutConfirm = true">
          退出登录
        </button>
      </div>
    </div>

    <!-- 退出确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showLogoutConfirm"
        title="确认退出"
        message="确定要退出登录吗？"
        confirm-text="退出"
        confirm-variant="danger"
        @confirm="handleLogout"
        @cancel="showLogoutConfirm = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import NaturalButton from '@/components/common/NaturalButton.vue'
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue'
import PersonalInfoCard from './components/PersonalInfoCard.vue'
import { useNoteStore } from '@/stores/note'
import { useTaskStore } from '@/stores/task'
import { useAiStore } from '@/stores/ai'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const noteStore = useNoteStore()
const taskStore = useTaskStore()
const aiStore = useAiStore()

const user = computed(() => userStore.user)
const isLoadingUser = computed(() => userStore.isLoadingUser)
const userError = computed(() => userStore.userError)

const showLogoutConfirm = computed({
  get: () => false,
  set: (val) => {
    if (val) {
      // 使用原生 confirm 或自定义弹窗
      window.confirm('确定要退出登录吗？') && handleLogout()
    }
  }
})

const refreshUserInfo = () => {
  userStore.loadCurrentUser()
}

const goToStatistics = () => {
  router.push('/statistics')
}

const goToSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  await authStore.logout()
  // 清除各模块数据
  noteStore.clearAllNotes()
  taskStore.clearAllTasks()
  aiStore.clearAll()
  userStore.clearUserData()
  router.push('/login')
}

onMounted(() => {
  if (!user.value) {
    userStore.loadCurrentUser()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding-bottom: 80px;
}

.profile-container {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logout-section {
  margin-top: 16px;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  background: #F59E0B;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #D97706;
  transform: translateY(-2px);
}
</style>