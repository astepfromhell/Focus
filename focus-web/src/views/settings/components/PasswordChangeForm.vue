<template>
  <div class="password-change-form">
    <div class="form-header">
      <span class="header-icon">🔐</span>
      <span class="header-title">修改密码</span>
    </div>

    <!-- 当前密码 -->
    <div class="form-group">
      <label class="form-label">当前密码</label>
      <div class="input-wrapper">
        <span class="input-icon">🔒</span>
        <input
            :type="showOldPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="请输入当前密码"
            :value="oldPassword"
            @input="onOldPasswordChange"
        />
        <button type="button" class="toggle-btn" @click="toggleOldPassword">
          {{ showOldPassword ? '🙈' : '👁️' }}
        </button>
      </div>
    </div>

    <!-- 新密码 -->
    <div class="form-group">
      <label class="form-label">新密码</label>
      <div class="input-wrapper">
        <span class="input-icon">🔒</span>
        <input
            :type="showNewPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="请输入新密码（至少6位）"
            :value="newPassword"
            @input="onNewPasswordChange"
        />
        <button type="button" class="toggle-btn" @click="toggleNewPassword">
          {{ showNewPassword ? '🙈' : '👁️' }}
        </button>
      </div>
      <!-- 密码强度指示器 -->
      <PasswordStrengthIndicator :strength="passwordStrength" />
    </div>

    <!-- 确认新密码 -->
    <div class="form-group">
      <label class="form-label">确认新密码</label>
      <div class="input-wrapper">
        <span class="input-icon">🔒</span>
        <input
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ error: !passwordsMatch && confirmPassword }"
            placeholder="请再次输入新密码"
            :value="confirmPassword"
            @input="onConfirmPasswordChange"
        />
        <button type="button" class="toggle-btn" @click="toggleConfirmPassword">
          {{ showConfirmPassword ? '🙈' : '👁️' }}
        </button>
      </div>
      <p v-if="!passwordsMatch && confirmPassword" class="error-hint">
        两次输入的密码不一致
      </p>
    </div>

    <!-- 错误消息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 成功消息 -->
    <div v-if="success" class="success-message">
      {{ success }}
    </div>

    <!-- 提交按钮 -->
    <button
        class="submit-btn"
        :disabled="!canSubmit || isChanging"
        @click="onSubmit"
    >
      <span v-if="isChanging" class="loading-spinner"></span>
      <span v-else>修改密码</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue'

const props = defineProps({
  oldPassword: {
    type: String,
    default: ''
  },
  newPassword: {
    type: String,
    default: ''
  },
  confirmPassword: {
    type: String,
    default: ''
  },
  passwordStrength: {
    type: Object,
    default: () => ({ label: '', class: '', progress: 0 })
  },
  passwordsMatch: {
    type: Boolean,
    default: true
  },
  isChanging: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  success: {
    type: String,
    default: null
  },
  canSubmit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:old-password',
  'update:new-password',
  'update:confirm-password',
  'submit'
])

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const onOldPasswordChange = (e) => {
  emit('update:old-password', e.target.value)
}

const onNewPasswordChange = (e) => {
  emit('update:new-password', e.target.value)
}

const onConfirmPasswordChange = (e) => {
  emit('update:confirm-password', e.target.value)
}

const toggleOldPassword = () => {
  showOldPassword.value = !showOldPassword.value
}

const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const onSubmit = () => {
  if (props.canSubmit && !props.isChanging) {
    emit('submit')
  }
}
</script>

<style scoped>
.password-change-form {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.header-icon {
  font-size: 18px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E2E;
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

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1px solid #D1D5DB;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #F9FAFB;
}

.form-input:focus {
  outline: none;
  border-color: #92A681;
  background: white;
  box-shadow: 0 0 0 3px rgba(146, 166, 129, 0.1);
}

.form-input.error {
  border-color: #DC2626;
}

.toggle-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}

.error-hint {
  font-size: 12px;
  color: #DC2626;
  margin-top: 6px;
  padding-left: 12px;
}

.error-message {
  background: #FEE2E2;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  color: #DC2626;
  text-align: center;
  margin-bottom: 20px;
}

.success-message {
  background: #D1FAE5;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  color: #059669;
  text-align: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #C3E1AF, #92A681);
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(146, 166, 129, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>