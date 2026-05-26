<template>
  <div
      class="note-card"
      :style="{ background: note.color }"
      :class="{ pinned: note.isPinned, selected: isSelected, 'multi-select': isMultiSelectMode }"
      @click="handleClick"
      @contextmenu.prevent="handleLongPress"
  >
    <div class="card-content">
      <!-- 多选模式下的复选框 -->
      <div v-if="isMultiSelectMode" class="checkbox" @click.stop="handleToggleSelect">
        <div class="check-box" :class="{ checked: isSelected }">
          <span v-if="isSelected" class="check-mark">✓</span>
        </div>
      </div>

      <!-- 置顶图标 -->
      <div v-if="note.isPinned && !isMultiSelectMode" class="pin-icon">📌</div>

      <!-- 便签内容 -->
      <div class="note-preview">
        <h3 class="note-title">{{ note.getTitle?.() || getTitle() }}</h3>
        <p class="note-preview-text">{{ note.getPreviewContent?.() || getPreviewContent() }}</p>
        <div class="note-time">{{ formatRelativeTime(note.updatedAt) }}</div>
      </div>

      <!-- 三点菜单（非多选模式） -->
      <div v-if="!isMultiSelectMode" class="menu-dropdown">
        <button class="menu-btn" @click.stop="showMenu = !showMenu">
          ⋮
        </button>
        <div v-if="showMenu" class="dropdown-menu" @click.stop>
          <button class="menu-item" @click="handlePin">
            <span class="menu-icon">📌</span>
            <span>{{ note.isPinned ? '取消置顶' : '置顶' }}</span>
          </button>
          <button class="menu-item" @click="handleArchive">
            <span class="menu-icon">{{ note.isArchived ? '📂' : '📦' }}</span>
            <span>{{ note.isArchived ? '取消归档' : '归档' }}</span>
          </button>
          <button class="menu-item delete" @click="handleDelete">
            <span class="menu-icon">🗑️</span>
            <span>删除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatRelativeTime } from '@/utils/dateTime'

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  isMultiSelectMode: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'click', 'long-press', 'toggle-select',
  'pin', 'archive', 'delete'
])

const showMenu = ref(false)

// 获取标题
const getTitle = () => {
  const content = props.note.content || ''
  const firstLine = content.split('\n')[0]?.trim() || ''
  return firstLine.length > 30 ? firstLine.slice(0, 30) + '...' : (firstLine || '无标题')
}

// 获取预览内容
const getPreviewContent = () => {
  const content = props.note.content || ''
  return content.length > 100 ? content.slice(0, 100) + '...' : (content || '空白便签')
}

const handleClick = () => {
  if (props.isMultiSelectMode) {
    emit('toggle-select')
  } else {
    emit('click')
  }
  showMenu.value = false
}

const handleLongPress = () => {
  if (!props.isMultiSelectMode) {
    emit('long-press')
  }
}

const handleToggleSelect = () => {
  emit('toggle-select')
}

const handlePin = () => {
  emit('pin')
  showMenu.value = false
}

const handleArchive = () => {
  emit('archive')
  showMenu.value = false
}

const handleDelete = () => {
  emit('delete')
  showMenu.value = false
}
</script>

<style scoped>
.note-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.note-card.selected {
  outline: 2px solid #92A681;
  outline-offset: 2px;
}

.note-card.multi-select {
  cursor: default;
}

.card-content {
  position: relative;
  padding: 16px;
}

.checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.check-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: white;
  border: 2px solid #D1D5DB;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.check-box.checked {
  background: #92A681;
  border-color: #92A681;
}

.check-mark {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.pin-icon {
  position: absolute;
  top: 12px;
  right: 48px;
  font-size: 16px;
  opacity: 0.7;
}

.note-preview {
  padding-right: 32px;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E2E;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-preview-text {
  font-size: 13px;
  color: #6A7B6E;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-time {
  font-size: 11px;
  color: #9CA3AF;
}

.menu-dropdown {
  position: absolute;
  top: 12px;
  right: 12px;
}

.menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.dropdown-menu {
  position: absolute;
  top: 36px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 20;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: #F3F4F6;
}

.menu-item.delete {
  color: #DC2626;
}

.menu-icon {
  font-size: 14px;
}
</style>