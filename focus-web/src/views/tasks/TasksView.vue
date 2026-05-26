<template>
  <div class="tasks-page">
    <AppHeader title="日程" emoji="📜" show-back @back="$router.back()" />

    <div class="tasks-container">
      <!-- 视图切换器 -->
      <div class="view-switcher">
        <button
            class="switch-btn"
            :class="{ active: currentView === 'TODAY' }"
            @click="switchView('TODAY')"
        >
          <span class="switch-icon">🪴</span>
          <span>今日视图</span>
        </button>
        <button
            class="switch-btn"
            :class="{ active: currentView === 'CALENDAR' }"
            @click="switchView('CALENDAR')"
        >
          <span class="switch-icon">🍂</span>
          <span>日历视图</span>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <TodayView
            v-if="currentView === 'TODAY'"
            :short-tasks="shortTasks"
            :long-tasks="longTasks"
            :is-loading="isLoading"
            @add-task="showTaskEditor"
            @edit-task="showTaskEditor"
            @delete-task="showDeleteConfirm"
            @toggle-complete="toggleComplete"
        />

        <CalendarView
            v-else
            :year-month="currentYearMonth"
            :tasks-map="calendarTasks"
            :selected-date="selectedDate"
            :is-loading="isLoading"
            @prev-month="prevMonth"
            @next-month="nextMonth"
            @today="goToToday"
            @date-click="selectDate"
        />
      </div>
    </div>

    <!-- 任务编辑器弹窗 -->
    <TaskEditorModal
        :visible="showEditor"
        :task="editingTask"
        :initial-date="editorInitialDate"
        @close="hideTaskEditor"
        @save="handleSaveTask"
    />

    <!-- 日期详情弹窗（日历视图） -->
    <DateDetailDialog
        v-if="selectedDate"
        :date="selectedDate"
        :short-tasks="selectedDateShortTasks"
        :long-tasks="selectedDateLongTasks"
        @close="clearSelectedDate"
        @task-click="showTaskEditor"
        @toggle-complete="toggleComplete"
        @add-task="handleAddTaskFromDate"
    />

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showDeleteConfirmDialog"
        title="确认删除"
        :message="`确定要删除任务「${taskToDelete?.title}」吗？`"
        confirm-text="删除"
        confirm-variant="danger"
        @confirm="confirmDelete"
        @cancel="hideDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue'
import TaskEditorModal from './components/TaskEditorModal.vue'
import TodayView from './TodayView.vue'
import CalendarView from './CalendarView.vue'
import DateDetailDialog from './components/DateDetailDialog.vue'

const taskStore = useTaskStore()

// 从 store 获取状态
const currentView = computed(() => taskStore.currentView)
const shortTasks = computed(() => taskStore.shortTasks)
const longTasks = computed(() => taskStore.longTasks)
const isLoading = computed(() => taskStore.isLoading)
const currentYearMonth = computed(() => taskStore.currentYearMonth)
const calendarTasks = computed(() => taskStore.calendarTasks)
const selectedDate = computed(() => taskStore.selectedDate)
const showEditor = computed(() => taskStore.showEditor)
const editingTask = computed(() => taskStore.editingTask)
const editorInitialDate = computed(() => taskStore.editorInitialDate)
const showDeleteConfirmDialog = computed(() => taskStore.showDeleteConfirm)
const taskToDelete = computed(() => taskStore.taskToDelete)

// 获取选中日期的任务
const selectedDateTasks = computed(() => taskStore.getTasksForSelectedDate())
const selectedDateShortTasks = computed(() => selectedDateTasks.value.shortTasks)
const selectedDateLongTasks = computed(() => selectedDateTasks.value.longTasks)

// 视图切换
const switchView = (view) => {
  taskStore.switchView(view)
}

// 日历操作
const prevMonth = () => {
  taskStore.changeMonth(-1)
}

const nextMonth = () => {
  taskStore.changeMonth(1)
}

const goToToday = () => {
  taskStore.goToToday()
}

const selectDate = (date) => {
  taskStore.selectDate(date)
}

const clearSelectedDate = () => {
  taskStore.clearSelectedDate()
}

// 任务编辑器
const showTaskEditor = (task = null, initialDate = null) => {
  taskStore.showTaskEditor(task, initialDate)
}

const hideTaskEditor = () => {
  taskStore.hideTaskEditor()
}

const handleSaveTask = async (taskData) => {
  await taskStore.saveTask(taskData)
}

// 完成任务切换
const toggleComplete = async (task) => {
  await taskStore.toggleComplete(task)
}

// 删除确认
const showDeleteConfirm = (task) => {
  taskStore.showDeleteConfirm(task)
}

const hideDeleteConfirm = () => {
  taskStore.hideDeleteConfirm()
}

const confirmDelete = async () => {
  await taskStore.confirmDelete()
}

// 从日期详情弹窗添加任务
const handleAddTaskFromDate = () => {
  const date = selectedDate.value
  clearSelectedDate()
  showTaskEditor(null, date)
}

// 加载数据
onMounted(() => {
  taskStore.loadTodayTasks()
})
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding-bottom: 80px;
}

.tasks-container {
  padding: 0 16px;
}

.view-switcher {
  background: white;
  border-radius: 40px;
  padding: 6px;
  display: flex;
  gap: 8px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.switch-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 32px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-btn.active {
  background: linear-gradient(135deg, #C3E1AF, #92A681);
  color: white;
  box-shadow: 0 2px 6px rgba(146, 166, 129, 0.3);
}

.switch-icon {
  font-size: 16px;
}

.content-area {
  margin-top: 8px;
}
</style>