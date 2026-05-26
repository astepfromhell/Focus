<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <!-- 头部 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '编辑任务' : '创建任务' }}</h3>
          <button class="close-btn" @click="handleClose">✕</button>
        </div>

        <!-- 表单内容 -->
        <div class="modal-body">
          <!-- 任务类型选择 -->
          <div class="form-group">
            <label class="form-label">任务类型 <span class="required">*</span></label>
            <div class="type-selector">
              <button
                  class="type-option"
                  :class="{ active: formData.type === 'SHORT' }"
                  @click="formData.type = 'SHORT'"
              >
                <span class="type-emoji">📋</span>
                <span class="type-name">短任务</span>
                <span class="type-desc">当日任务，有具体时间</span>
              </button>
              <button
                  class="type-option"
                  :class="{ active: formData.type === 'LONG' }"
                  @click="formData.type = 'LONG'"
              >
                <span class="type-emoji">📅</span>
                <span class="type-name">长任务</span>
                <span class="type-desc">多日项目，跨天截止</span>
              </button>
            </div>
          </div>

          <!-- 任务标题 -->
          <div class="form-group">
            <label class="form-label">任务标题 <span class="required">*</span></label>
            <input
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="请输入任务标题"
                maxlength="100"
            />
          </div>

          <!-- 任务描述 -->
          <div class="form-group">
            <label class="form-label">任务描述</label>
            <textarea
                v-model="formData.description"
                class="form-textarea"
                placeholder="请输入任务描述（可选）"
                rows="3"
                maxlength="500"
            ></textarea>
          </div>

          <!-- 短任务表单 -->
          <template v-if="formData.type === 'SHORT'">
            <div class="form-group">
              <label class="form-label">日期 <span class="required">*</span></label>
              <DatePickerField v-model="formData.date" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">开始时间</label>
                <TimePickerField v-model="formData.startTime" />
              </div>
              <div class="form-group">
                <label class="form-label">结束时间</label>
                <TimePickerField v-model="formData.endTime" />
              </div>
            </div>
          </template>

          <!-- 长任务表单 -->
          <template v-else>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">开始日期 <span class="required">*</span></label>
                <DatePickerField v-model="formData.startDate" />
              </div>
              <div class="form-group">
                <label class="form-label">结束日期 <span class="required">*</span></label>
                <DatePickerField v-model="formData.endDate" :min-date="formData.startDate" />
              </div>
            </div>
          </template>

          <!-- 提醒设置 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.reminder" type="checkbox" />
              <span>设置提醒</span>
            </label>
            <p v-if="formData.reminder" class="form-hint">
              {{ reminderHint }}
            </p>
          </div>

          <!-- 错误提示 -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="handleClose">取消</button>
          <button class="btn-submit" :disabled="!isValid" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import DatePickerField from './DatePickerField.vue'
import TimePickerField from './TimePickerField.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  },
  initialDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const errorMessage = ref('')

// 默认表单数据
const getDefaultFormData = () => ({
  id: null,
  title: '',
  description: '',
  type: 'SHORT',
  date: dayjs().format('YYYY-MM-DD'),
  startTime: dayjs().format('HH:mm'),
  endTime: '23:59',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  reminder: false
})

const formData = ref(getDefaultFormData())

const isEdit = computed(() => !!props.task?.id)

// 提醒提示文字
const reminderHint = computed(() => {
  if (formData.value.type === 'SHORT') {
    return '将在任务开始/结束前 5 分钟提醒'
  }
  return '将在截止日早上 9:00 前 5 分钟提醒'
})

// 验证表单
const isValid = computed(() => {
  if (!formData.value.title.trim()) return false

  if (formData.value.type === 'SHORT') {
    if (!formData.value.date) return false
    if (formData.value.startTime && formData.value.endTime) {
      if (formData.value.startTime >= formData.value.endTime) return false
    }
  } else {
    if (!formData.value.startDate || !formData.value.endDate) return false
    if (formData.value.startDate >= formData.value.endDate) return false
  }

  return true
})

// 初始化表单
const initForm = () => {
  if (props.task) {
    // 编辑模式
    const task = props.task
    formData.value = {
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      type: task.type || 'SHORT',
      date: task.date || dayjs().format('YYYY-MM-DD'),
      startTime: task.startTime || dayjs().format('HH:mm'),
      endTime: task.endTime || '23:59',
      startDate: task.startDate || dayjs().format('YYYY-MM-DD'),
      endDate: task.endDate || dayjs().add(1, 'day').format('YYYY-MM-DD'),
      reminder: task.reminder || false
    }
  } else {
    // 创建模式
    formData.value = {
      ...getDefaultFormData(),
      date: props.initialDate || dayjs().format('YYYY-MM-DD'),
      startDate: props.initialDate || dayjs().format('YYYY-MM-DD')
    }
  }
  errorMessage.value = ''
}

// 提交表单
const handleSubmit = () => {
  if (!isValid.value) return

  const submitData = { ...formData.value }

  if (submitData.type === 'SHORT') {
    delete submitData.startDate
    delete submitData.endDate
  } else {
    delete submitData.date
    delete submitData.startTime
    delete submitData.endTime
  }

  emit('save', submitData)
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 监听 visible 变化，初始化表单
watch(
    () => props.visible,
    (val) => {
      if (val) {
        initForm()
      }
    },
    { immediate: true }
)

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
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C3E2E;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 20px;
  color: #9CA3AF;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #F3F4F6;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E5E7EB;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #DC2626;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #92A681;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.type-selector {
  display: flex;
  gap: 12px;
}

.type-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-option.active {
  background: #E8F5E9;
  border-color: #92A681;
}

.type-emoji {
  font-size: 24px;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #2C3E2E;
}

.type-desc {
  font-size: 11px;
  color: #9CA3AF;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.form-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #92A681;
}

.error-message {
  margin-top: 12px;
  padding: 10px;
  background: #FEE2E2;
  border-radius: 8px;
  font-size: 13px;
  color: #DC2626;
  text-align: center;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-submit {
  background: #92A681;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #7A9A6A;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>