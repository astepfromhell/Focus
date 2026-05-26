<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-container">
        <div class="modal-icon" v-if="icon">
          <span>{{ icon }}</span>
        </div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="modal-btn modal-btn-confirm" :class="confirmVariant" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认'
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmVariant: {
    type: String,
    default: 'danger', // danger, primary, warning
    validator: (val) => ['danger', 'primary', 'warning'].includes(val)
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// 阻止背景滚动
watch(
    () => props.visible,
    (val) => {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
)

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 24px;
  padding: 24px;
  max-width: 320px;
  width: 85%;
  text-align: center;
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E2E;
  margin-bottom: 8px;
}

.modal-message {
  font-size: 14px;
  color: #6A7B6E;
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-btn-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.modal-btn-cancel:hover {
  background: #E5E7EB;
}

.modal-btn-confirm {
  background: #92A681;
  color: white;
}

.modal-btn-confirm:hover {
  background: #7A9A6A;
}

.modal-btn-confirm.danger {
  background: #DC2626;
}

.modal-btn-confirm.danger:hover {
  background: #B91C1C;
}

.modal-btn-confirm.warning {
  background: #F59E0B;
}

.modal-btn-confirm.warning:hover {
  background: #D97706;
}
</style>