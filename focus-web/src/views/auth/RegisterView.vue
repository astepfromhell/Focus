<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <img src="/favicon.ico" alt="Focus" class="logo-icon" />
        <h1 class="logo-title">心流森境</h1>
      </div>

      <!-- 欢迎文字 -->
      <div class="welcome-section">
        <h2 class="welcome-title">创建账号</h2>
        <p class="welcome-subtitle">填写信息以开始使用心流森境</p>
      </div>

      <!-- 注册表单 -->
      <form class="register-form" @submit.prevent="handleRegister">
        <!-- 用户名 -->
        <div class="form-group">
          <div class="input-icon">👤</div>
          <input
              v-model="formData.username"
              type="text"
              class="form-input"
              placeholder="用户名"
              :class="{ error: errors.username }"
              @blur="validateUsernameField"
          />
          <span v-if="checkingUsername" class="checking-spinner"></span>
          <span v-else-if="usernameValid" class="check-success">✓</span>
        </div>
        <p v-if="errors.username" class="error-text">{{ errors.username }}</p>

        <!-- 邮箱 -->
        <div class="form-group">
          <div class="input-icon">📧</div>
          <input
              v-model="formData.email"
              type="email"
              class="form-input"
              placeholder="邮箱"
              :class="{ error: errors.email }"
              @blur="validateEmailField"
          />
          <span v-if="checkingEmail" class="checking-spinner"></span>
          <span v-else-if="emailValid" class="check-success">✓</span>
        </div>
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

        <!-- 密码 -->
        <div class="form-group">
          <div class="input-icon">🔒</div>
          <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="密码（至少6位）"
              :class="{ error: errors.password }"
              @input="checkPasswordStrength"
          />
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <!-- 密码强度指示器 -->
        <div v-if="formData.password" class="strength-bar">
          <div class="strength-fill" :class="passwordStrength.class" :style="{ width: passwordStrength.progress + '%' }"></div>
          <span class="strength-label" :class="passwordStrength.class">{{ passwordStrength.label }}</span>
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

        <!-- 确认密码 -->
        <div class="form-group">
          <div class="input-icon">🔒</div>
          <input
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="确认密码"
              :class="{ error: errors.confirmPassword }"
              @input="validateConfirmPasswordField"
          />
          <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
            {{ showConfirmPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>

        <!-- 服务条款 -->
        <label class="terms-label">
          <input v-model="formData.agreeTerms" type="checkbox" />
          <span>我已阅读并同意用户协议和隐私政策</span>
        </label>
        <p v-if="errors.terms" class="error-text">{{ errors.terms }}</p>

        <!-- 错误提示 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <!-- 注册按钮 -->
        <button type="submit" class="register-btn" :disabled="loading || !canSubmit">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>注册</span>
        </button>
      </form>

      <!-- 登录链接 -->
      <div class="login-link">
        <span>已有账号？</span>
        <button type="button" class="link-btn" @click="goToLogin">立即登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateUsername, validateEmail, validatePassword, calculatePasswordStrength } from '@/utils/validation'
import { checkUsername, checkEmail } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const checkingUsername = ref(false)
const checkingEmail = ref(false)
const usernameValid = ref(false)
const emailValid = ref(false)

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: ''
})

const passwordStrength = ref({ label: '', class: '', progress: 0 })

// 检查是否可以提交
const canSubmit = computed(() => {
  return usernameValid.value &&
      emailValid.value &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.agreeTerms
})

// 验证用户名
const validateUsernameField = async () => {
  const result = validateUsername(formData.username)
  if (!result.valid) {
    errors.username = result.message
    usernameValid.value = false
    return false
  }

  checkingUsername.value = true
  try {
    const response = await checkUsername(formData.username.trim())
    checkingUsername.value = false
    if (response.success && response.data?.available) {
      errors.username = ''
      usernameValid.value = true
      return true
    } else {
      errors.username = response.message || '用户名已被占用'
      usernameValid.value = false
      return false
    }
  } catch (error) {
    checkingUsername.value = false
    errors.username = '检查用户名失败'
    usernameValid.value = false
    return false
  }
}

// 验证邮箱
const validateEmailField = async () => {
  const result = validateEmail(formData.email)
  if (!result.valid) {
    errors.email = result.message
    emailValid.value = false
    return false
  }

  checkingEmail.value = true
  try {
    const response = await checkEmail(formData.email.trim())
    checkingEmail.value = false
    if (response.success && response.data?.available) {
      errors.email = ''
      emailValid.value = true
      return true
    } else {
      errors.email = response.message || '邮箱已被注册'
      emailValid.value = false
      return false
    }
  } catch (error) {
    checkingEmail.value = false
    errors.email = '检查邮箱失败'
    emailValid.value = false
    return false
  }
}

// 检查密码强度
const checkPasswordStrength = () => {
  const strength = calculatePasswordStrength(formData.password)
  passwordStrength.value = {
    label: strength.label,
    class: strength.strength.toLowerCase(),
    progress: strength.progress * 100
  }

  const result = validatePassword(formData.password)
  errors.password = result.valid ? '' : result.message
}

// 验证确认密码
const validateConfirmPasswordField = () => {
  if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

// 验证条款
const validateTerms = () => {
  if (!formData.agreeTerms) {
    errors.terms = '请阅读并同意用户协议和隐私政策'
    return false
  }
  errors.terms = ''
  return true
}

// 注册
const handleRegister = async () => {
  // 执行所有验证
  const isUsernameValid = await validateUsernameField()
  const isEmailValid = await validateEmailField()
  checkPasswordStrength()
  validateConfirmPasswordField()
  const isTermsValid = validateTerms()

  if (!isUsernameValid || !isEmailValid || errors.password || errors.confirmPassword || !isTermsValid) {
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const result = await authStore.register(
      formData.username.trim(),
      formData.email.trim(),
      formData.password
  )

  loading.value = false

  if (result.success) {
    successMessage.value = '注册成功！正在跳转到登录页面...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    errorMessage.value = result.message || '注册失败，请稍后重试'
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding: 20px;
}

.register-container {
  max-width: 400px;
  width: 100%;
  background: white;
  border-radius: 32px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.logo-section {
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.logo-title {
  font-size: 20px;
  font-weight: 700;
  color: #2C3E2E;
}

.welcome-section {
  text-align: center;
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 13px;
  color: #6B7280;
}

.register-form {
  margin-bottom: 20px;
}

.form-group {
  position: relative;
  margin-bottom: 8px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1px solid #E5E7EB;
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

.checking-spinner {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top-color: #92A681;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.check-success {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #10B981;
  font-size: 16px;
  font-weight: bold;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.strength-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 4px;
}

.strength-fill {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  transition: width 0.2s ease;
}

.strength-fill.weak {
  background: #DC2626;
}

.strength-fill.medium {
  background: #D97706;
}

.strength-fill.strong {
  background: #16A34A;
}

.strength-label {
  font-size: 11px;
  min-width: 28px;
}

.strength-label.weak {
  color: #DC2626;
}

.strength-label.medium {
  color: #D97706;
}

.strength-label.strong {
  color: #16A34A;
}

.error-text {
  font-size: 11px;
  color: #DC2626;
  margin-bottom: 12px;
  margin-top: -4px;
  padding-left: 12px;
}

.terms-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  font-size: 12px;
  color: #6B7280;
  cursor: pointer;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(146, 166, 129, 0.3);
}

.register-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #FEE2E2;
  padding: 10px;
  border-radius: 12px;
  font-size: 13px;
  color: #DC2626;
  text-align: center;
  margin-bottom: 16px;
}

.success-message {
  background: #D1FAE5;
  padding: 10px;
  border-radius: 12px;
  font-size: 13px;
  color: #059669;
  text-align: center;
  margin-bottom: 16px;
}

.login-link {
  text-align: center;
  font-size: 13px;
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
  width: 18px;
  height: 18px;
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