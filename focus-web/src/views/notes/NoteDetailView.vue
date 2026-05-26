<template>
  <div class="note-detail-page">
    <AppHeader title="编辑便签" emoji="📝" show-back @back="handleBack" />

    <div class="note-detail-container">
      <div class="note-content" :style="{ background: currentColor }">
        <!-- 编辑区域 -->
        <textarea
            v-model="editContent"
            class="note-editor"
            placeholder="输入便签内容..."
            @input="onContentChange"
        ></textarea>

        <!-- 工具栏 -->
        <div class="toolbar">
          <!-- 颜色选择器 -->
          <div class="color-section">
            <div class="section-title">🎨 便签颜色</div>
            <div class="color-grid">
              <button
                  v-for="color in colorOptions"
                  :key="color.hex"
                  class="color-circle"
                  :style="{ background: color.hex }"
                  :class="{ active: currentColor === color.hex }"
                  @click="changeColor(color.hex)"
              >
                <span v-if="currentColor === color.hex" class="check-mark">✓</span>
              </button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button class="action-btn" :class="{ active: note?.isPinned }" @click="togglePin">
              <span class="btn-icon">📌</span>
              <span>{{ note?.isPinned ? '取消置顶' : '置顶' }}</span>
            </button>
            <button class="action-btn" :class="{ active: note?.isArchived }" @click="toggleArchive">
              <span class="btn-icon">{{ note?.isArchived ? '📂' : '📦' }}</span>
              <span>{{ note?.isArchived ? '取消归档' : '归档' }}</span>
            </button>
            <button class="action-btn delete" @click="showDeleteConfirm = true">
              <span class="btn-icon">🗑️</span>
              <span>删除</span>
            </button>
          </div>

          <!-- 元信息 -->
          <div class="meta-info">
            <div class="meta-item">创建时间: {{ formatDateTime(note?.createdAt) }}</div>
            <div class="meta-item">最后编辑: {{ formatRelativeTime(note?.updatedAt) }}</div>
          </div>

          <!-- 自动保存状态 -->
          <div v-if="isSaving" class="save-status saving">保存中...</div>
          <div v-else-if="hasUnsavedChanges" class="save-status unsaved">未保存</div>
          <div v-else class="save-status saved">已保存</div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showDeleteConfirm"
        title="删除便签"
        message="确定要删除这条便签吗？此操作无法撤销。"
        confirm-text="删除"
        confirm-variant="danger"
        @confirm="handleDelete"
        @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue'
import { NOTE_COLORS } from '@/utils/constants'
import { formatDateTime, formatRelativeTime } from '@/utils/dateTime'

const router = useRouter()
const route = useRoute()
const noteStore = useNoteStore()

const noteId = computed(() => parseInt(route.params.id))

const note = computed(() => noteStore.currentNote)
const editContent = ref('')
const currentColor = ref('')
const hasUnsavedChanges = ref(false)
const isSaving = ref(false)
const showDeleteConfirm = ref(false)

let autoSaveTimer = null
const AUTO_SAVE_DELAY = 1000

const colorOptions = NOTE_COLORS

// 加载便签
const loadNote = async () => {
  await noteStore.loadNoteById(noteId.value)
  if (note.value) {
    editContent.value = note.value.content
    currentColor.value = note.value.color
    hasUnsavedChanges.value = false
  }
}

// 内容变化（防抖自动保存）
const onContentChange = () => {
  hasUnsavedChanges.value = true

  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    saveNote()
  }, AUTO_SAVE_DELAY)
}

// 保存便签
const saveNote = async () => {
  if (!hasUnsavedChanges.value) return

  isSaving.value = true
  const result = await noteStore.updateNote(noteId.value, {
    content: editContent.value,
    color: currentColor.value
  })
  isSaving.value = false

  if (result.success) {
    hasUnsavedChanges.value = false
  }
}

// 更改颜色
const changeColor = (color) => {
  currentColor.value = color
  saveNote()
}

// 切换置顶
const togglePin = async () => {
  await noteStore.togglePin(noteId.value, !note.value?.isPinned)
  await loadNote()
}

// 切换归档
const toggleArchive = async () => {
  await noteStore.toggleArchive(noteId.value, !note.value?.isArchived)
  await loadNote()
}

// 删除便签
const handleDelete = async () => {
  await noteStore.deleteNote(noteId.value)
  router.back()
}

// 返回
const handleBack = () => {
  if (hasUnsavedChanges.value) {
    saveNote()
  }
  router.back()
}

// 组件卸载时保存
onUnmounted(() => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  if (hasUnsavedChanges.value) {
    saveNote()
  }
})

onMounted(() => {
  loadNote()
})
</script>

<style scoped>
.note-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
}

.note-detail-container {
  padding: 16px;
  min-height: calc(100vh - 60px);
}

.note-content {
  border-radius: 24px;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.2s ease;
}

.note-editor {
  flex: 1;
  width: 100%;
  min-height: 300px;
  padding: 20px;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.6;
  color: #2C3E2E;
  resize: vertical;
  font-family: inherit;
}

.note-editor:focus {
  outline: none;
}

.note-editor::placeholder {
  color: rgba(0, 0, 0, 0.3);
}

.toolbar {
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.color-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle.active {
  border-color: #374151;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.check-mark {
  font-size: 20px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
  text-shadow: 0 0 2px white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 1px solid #D1D5DB;
  border-radius: 40px;
  background: white;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.active {
  background: #E8F5E9;
  border-color: #92A681;
  color: #4A7A5A;
}

.action-btn.delete {
  color: #DC2626;
  border-color: #FEE2E2;
}

.action-btn.delete:hover {
  background: #FEE2E2;
}

.btn-icon {
  font-size: 14px;
}

.meta-info {
  margin-bottom: 12px;
  font-size: 12px;
  color: #9CA3AF;
}

.meta-item {
  margin-bottom: 4px;
}

.save-status {
  text-align: right;
  font-size: 12px;
}

.save-status.saving {
  color: #F59E0B;
}

.save-status.unsaved {
  color: #DC2626;
}

.save-status.saved {
  color: #10B981;
}
</style>