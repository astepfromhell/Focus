<template>
  <div class="statistics-page">
    <AppHeader title="数据统计" emoji="🌾" show-back @back="$router.back()" />

    <div class="statistics-container">
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner />
      </div>

      <div v-else-if="error" class="error-state">
        <ErrorState :message="error" @retry="loadData" />
      </div>

      <div v-else class="statistics-content">
        <!-- 用户信息卡片 -->
        <UserInfoCard
            :user="user"
            :is-loading="isLoadingUser"
            :error="userError"
            @refresh="refreshUserInfo"
        />

        <!-- 日期范围选择器 -->
        <DateRangePicker
            :selected-range="selectedRange"
            @change="changeDateRange"
        />

        <!-- 番茄钟统计汇总 -->
        <PomodoroSummaryCard :summary="pomodoroSummary" />

        <!-- 每日统计图表 -->
        <DailyStatisticsChart
            v-if="dailyStatistics.length > 0"
            :data="dailyStatistics"
        />

        <!-- 任务统计 -->
        <TaskStatisticsCard :task-stats="taskSummary" />

        <!-- 便签统计 -->
        <NoteStatisticsCard :note-stats="noteStatistics" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import AppHeader from '@/components/layout/AppHeader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import UserInfoCard from './components/UserInfoCard.vue'
import DateRangePicker from './components/DateRangePicker.vue'
import PomodoroSummaryCard from './components/PomodoroSummaryCard.vue'
import DailyStatisticsChart from './components/DailyStatisticsChart.vue'
import TaskStatisticsCard from './components/TaskStatisticsCard.vue'
import NoteStatisticsCard from './components/NoteStatisticsCard.vue'

const statisticsStore = useStatisticsStore()

// 状态
const isLoading = computed(() => statisticsStore.isLoading)
const error = computed(() => statisticsStore.error)
const user = computed(() => statisticsStore.user)
const isLoadingUser = computed(() => statisticsStore.isLoadingUser)
const userError = computed(() => statisticsStore.userError)
const selectedRange = computed(() => statisticsStore.selectedRange)
const pomodoroSummary = computed(() => statisticsStore.pomodoroSummary)
const dailyStatistics = computed(() => statisticsStore.dailyStatistics)
const taskSummary = computed(() => statisticsStore.taskSummary)
const noteStatistics = computed(() => statisticsStore.noteStatistics)

// 方法
const loadData = () => {
  statisticsStore.loadData()
}

const refreshUserInfo = () => {
  statisticsStore.refreshUserInfo()
}

const changeDateRange = (range) => {
  statisticsStore.changeDateRange(range)
}

onMounted(() => {
  statisticsStore.init()
})
</script>

<style scoped>
.statistics-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding-bottom: 80px;
}

.statistics-container {
  padding: 0 16px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.error-state {
  padding: 60px 0;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>