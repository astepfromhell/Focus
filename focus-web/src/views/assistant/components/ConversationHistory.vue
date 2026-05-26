<template>
  <Teleport to="body">
    <div v-if="visible" class="history-overlay" @click.self="handleClose">
      <div class="history-sheet">
        <!-- 头部 -->
        <div class="sheet-header">
          <div class="drag-handle"></div>
          <div class="header-content">
            <h3 class="sheet-title">📋 历史会话</h3>
            <span v-if="!isLoading && conversations.length > 0" class="sheet-count">
              {{ conversations.length }} 条
            </span>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="sheet-content">
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
          </div>

          <div v-else-if="conversations.length === 0" class="empty-state">
            <span class="empty-emoji">🌿</span>
            <p class="empty-text">暂无历史会话</p>
          </div>

          <div v-else class="conversation-list">
            <div
                v-for="conv in conversations"
                :key="conv.id"
                class="conversation-item"
                :class="{ active: conv.id === currentConversationId }"
                @click="handleRestore(conv.id)"
            >
              <div class="item-indicator" :class="{ active: conv.id === currentConversationId }"></div>
              <div class="item-content">
                <div class="item-title">{{ conv.title || '新对话' }}</div>
                <div class="item-meta">
                  <span class="item-time">{{ formatTime(conv.updatedAt) }}</span>
                  <span v-if="conv.messageCount" class="item-count">· {{ conv.messageCount }} 条消息</span>
                </div>
              </div>
              <button class="delete-btn" @click.stop="handleDeleteClick(conv.id)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showDeleteConfirm"
        title="删除会话"
        message="确定要删除这条历史会话吗？"
        confirm-text="删除"
        confirm-variant="danger"
        @confirm="confirmDelete"
        @cancel="showDeleteConfirm = false"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  conversations: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  currentConversationId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'restore', 'delete'])

const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)

const handleClose = () => {
  emit('close')
}

const handleRestore = (id) => {
  if (id !== props.currentConversationId) {
    emit('restore', id)
  }
  handleClose()
}

const handleDeleteClick = (id) => {
  pendingDeleteId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (pendingDeleteId.value) {
    emit('delete', pendingDeleteId.value)
    pendingDeleteId.value = null
  }
  showDeleteConfirm.value = false
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)}天前`

  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.history-sheet {
  background: #F5F8EF;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drag-handle {
  width: 40px;
  height: 4px;
  background: #CBD9BF;
  border-radius: 2px;
  margin: 12px auto 8px;
}

.sheet-header {
  padding: 8px 20px 16px;
  border-bottom: 1px solid #E5EDD4;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  color: #2C3E2E;
}

.sheet-count {
  font-size: 13px;
  color: #9CA3AF;
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 20px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5EDD4;
  border-top-color: #8BC34A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.empty-emoji {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #9CA3AF;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.conversation-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.conversation-item.active {
  background: #E8F5E0;
  border: 1px solid #8BC34A;
}

.item-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #DDE8D0;
  flex-shrink: 0;
}

.item-indicator.active {
  background: #8BC34A;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #2C3E2E;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #9CA3AF;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.delete-btn:hover {
  background: #FEE2E2;
}
</style>