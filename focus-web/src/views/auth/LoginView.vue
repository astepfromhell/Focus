<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <img src="/favicon.ico" alt="Focus" class="logo-icon" />
        <h1 class="logo-title">心流森境</h1>
      </div>

      <!-- 欢迎文字 -->
      <div class="welcome-section">
        <h2 class="welcome-title">欢迎回来</h2>
        <p class="welcome-subtitle">登录以继续使用心流森境</p>
      </div>

      <!-- 登录表单 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- 邮箱输入 -->
        <div class="form-group">
          <div class="input-icon">📧</div>
          <input
              v-model="formData.email"
              type="email"
              class="form-input"
              placeholder="邮箱"
              :class="{ error: errors.email }"
          />
        </div>
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

        <!-- 密码输入 -->
        <div class="form-group">
          <div class="input-icon">🔒</div>
          <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="密码"
              :class="{ error: errors.password }"
          />
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

        <!-- 记住我和忘记密码 -->
        <div class="form-options">
          <label class="checkbox-label">
            <input v-model="formData.rememberMe" type="checkbox" />
            <span>记住我</span>
          </label>
          <button type="button" class="forgot-link" @click="handleForgotPassword">
            忘记密码?
          </button>
        </div>

        <!-- 错误提示 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <!-- 登录按钮 -->
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>登录</span>
        </button>
      </form>

      <!-- 注册链接 -->
      <div class="register-link">
        <span>还没有账号？</span>
        <button type="button" class="link-btn" @click="goToRegister">立即注册</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  let isValid = true

  const emailResult = validateEmail(formData.email)
  if (!emailResult.valid) {
    errors.email = emailResult.message
    isValid = false
  } else {
    errors.email = ''
  }

  const passwordResult = validatePassword(formData.password)
  if (!passwordResult.valid) {
    errors.password = passwordResult.message
    isValid = false
  } else {
    errors.password = ''
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login(
      formData.email.trim(),
      formData.password,
      formData.rememberMe
  )

  loading.value = false

  if (result.success) {
    router.push('/home')
  } else {
    errorMessage.value = result.message || '登录失败，请检查邮箱和密码'
  }
}

const goToRegister = () => {
  router.push('/register')
}

const handleForgotPassword = () => {
  // TODO: 实现忘记密码功能
  alert('请联系管理员重置密码')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding: 20px;
}

.login-container {
  max-width: 400px;
  width: 100%;
  background: white;
  border-radius: 32px;
  padding: 40px 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
}

.logo-title {
  font-size: 24px;
  font-weight: 700;
  color: #2C3E2E;
}

.welcome-section {
  text-align: center;
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #6B7280;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  position: relative;
  margin-bottom: 8px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  font-size: 16px;
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

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.error-text {
  font-size: 12px;
  color: #DC2626;
  margin-bottom: 12px;
  margin-top: -4px;
  padding-left: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
}

.forgot-link {
  background: none;
  border: none;
  font-size: 14px;
  color: #92A681;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(146, 166, 129, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #FEE2E2;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  color: #DC2626;
  text-align: center;
  margin-bottom: 16px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #6B7280;
}

.link-btn {
  background: none;
  border: none;
  color: #84A786;
  font-weight: 500;
  cursor: pointer;
  margin-left: 4px;
}

.link-btn:hover {
  text-decoration: underline;
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