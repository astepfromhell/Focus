<template>
  <div class="notes-page">
    <AppHeader title="便签" emoji="🌿" show-back @back="$router.back()" />

    <div class="notes-container">
      <!-- Tab 切换 -->
      <div class="tabs">
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'ACTIVE' }"
            @click="switchTab('ACTIVE')"
        >
          📋 活跃便签
        </button>
        <button
            class="tab-btn"
            :class="{ active: currentTab === 'ARCHIVED' }"
            @click="switchTab('ARCHIVED')"
        >
          📦 归档便签
        </button>
      </div>

      <!-- 多选工具栏 -->
      <div v-if="isMultiSelectMode" class="multi-select-bar">
        <div class="select-info">
          <button class="cancel-btn" @click="exitMultiSelectMode">✕</button>
          <span>已选择 {{ selectionCount }} 项</span>
        </div>
        <div class="select-actions">
          <button class="action-btn" @click="batchArchive">
            {{ currentTab === 'ACTIVE' ? '📦 归档' : '📂 取消归档' }}
          </button>
          <button class="action-btn delete" @click="batchDelete">🗑️ 删除</button>
        </div>
      </div>

      <!-- 便签列表 -->
      <div class="notes-list">
        <div v-if="isLoading" class="loading-state">
          <LoadingSpinner />
        </div>

        <div v-else-if="displayedNotes.length === 0" class="empty-state">
          <EmptyState
              :emoji="currentTab === 'ACTIVE' ? '📝' : '📦'"
              :title="currentTab === 'ACTIVE' ? '暂无便签' : '暂无归档便签'"
              :description="currentTab === 'ACTIVE' ? '点击右下角按钮创建新便签' : ''"
          />
        </div>

        <div v-else class="notes-grid">
          <NoteCard
              v-for="note in displayedNotes"
              :key="note.id"
              :note="note"
              :is-multi-select-mode="isMultiSelectMode"
              :is-selected="selectedNoteIds.has(note.id)"
              @click="handleNoteClick(note)"
              @long-press="handleNoteLongPress(note)"
              @toggle-select="toggleNoteSelection(note.id)"
              @pin="handleTogglePin(note)"
              @archive="handleToggleArchive(note)"
              @delete="handleDeleteNote(note.id)"
          />
        </div>
      </div>
    </div>

    <!-- FAB 创建按钮 -->
    <button v-if="!isMultiSelectMode" class="fab-btn" @click="createNote">
      <span class="fab-icon">+</span>
    </button>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showDeleteConfirm"
        title="删除便签"
        message="确定要删除这条便签吗？此操作无法撤销。"
        confirm-text="删除"
        confirm-variant="danger"
        @confirm="confirmDelete"
        @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import AppHeader from '@/components/layout/AppHeader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue'
import NoteCard from './components/NoteCard.vue'

const router = useRouter()
const noteStore = useNoteStore()

// 从 store 获取状态
const currentTab = computed(() => noteStore.currentTab)
const displayedNotes = computed(() => noteStore.displayedNotes)
const isLoading = computed(() =>
    currentTab.value === 'ACTIVE' ? noteStore.isLoadingActive : noteStore.isLoadingArchived
)
const isMultiSelectMode = computed(() => noteStore.isMultiSelectMode)
const selectedNoteIds = computed(() => noteStore.selectedNoteIds)
const selectionCount = computed(() => noteStore.selectionCount)

// 本地状态
const showDeleteConfirm = ref(false)
const deletingNoteId = ref(null)

// 切换标签页
const switchTab = (tab) => {
  noteStore.switchTab(tab)
}

// 退出多选模式
const exitMultiSelectMode = () => {
  noteStore.exitMultiSelectMode()
}

// 切换便签选中状态
const toggleNoteSelection = (id) => {
  noteStore.toggleNoteSelection(id)
}

// 点击便签
const handleNoteClick = (note) => {
  if (isMultiSelectMode.value) {
    toggleNoteSelection(note.id)
  } else {
    router.push(`/note/${note.id}`)
  }
}

// 长按便签
const handleNoteLongPress = (note) => {
  if (!isMultiSelectMode.value) {
    noteStore.enterMultiSelectMode()
    toggleNoteSelection(note.id)
  }
}

// 切换置顶
const handleTogglePin = async (note) => {
  await noteStore.togglePin(note.id, !note.isPinned)
}

// 切换归档
const handleToggleArchive = async (note) => {
  await noteStore.toggleArchive(note.id, !note.isArchived)
}

// 删除便签（显示确认弹窗）
const handleDeleteNote = (id) => {
  deletingNoteId.value = id
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (deletingNoteId.value) {
    await noteStore.deleteNote(deletingNoteId.value)
    deletingNoteId.value = null
  }
  showDeleteConfirm.value = false
}

// 批量归档
const batchArchive = async () => {
  const ids = Array.from(selectedNoteIds.value)
  const isArchived = currentTab.value === 'ACTIVE'
  await noteStore.batchArchive(ids, isArchived)
}

// 批量删除
const batchDelete = async () => {
  const ids = Array.from(selectedNoteIds.value)
  await noteStore.batchDeleteNotes(ids)
}

// 创建便签
const createNote = async () => {
  const result = await noteStore.createNote({
    content: '',
    color: '#fffab3',
    isArchived: currentTab.value === 'ARCHIVED'
  })
  if (result.success) {
    router.push(`/note/${result.note.id}`)
  }
}

// 加载数据
onMounted(() => {
  noteStore.loadActiveNotes()
  noteStore.loadArchivedNotes()
})
</script>

<style scoped>
.notes-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding-bottom: 80px;
}

.notes-container {
  padding: 0 16px;
}

.tabs {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  background: white;
  padding: 6px;
  border-radius: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #C3E1AF, #92A681);
  color: white;
  box-shadow: 0 2px 6px rgba(146, 166, 129, 0.3);
}

.multi-select-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.select-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cancel-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F3F4F6;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.select-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: #F3F4F6;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn.delete {
  color: #DC2626;
}

.action-btn:hover {
  background: #E5E7EB;
}

.notes-list {
  min-height: 60vh;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-state {
  padding: 60px 0;
}

.notes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab-btn {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #C3E1AF, #92A681);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 40;
}

.fab-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab-icon {
  font-size: 28px;
  font-weight: 300;
  color: white;
}
</style>