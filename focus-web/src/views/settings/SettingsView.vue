<template>
  <div class="settings-page">
    <AppHeader title="设置" emoji="☘️" show-back @back="$router.back()" />

    <div class="settings-container">
      <!-- 修改密码区域 -->
      <PasswordChangeForm
          :old-password="oldPassword"
          :new-password="newPassword"
          :confirm-password="confirmPassword"
          :password-strength="passwordStrength"
          :passwords-match="passwordsMatch"
          :is-changing="isChangingPassword"
          :error="passwordError"
          :success="passwordSuccess"
          :can-submit="canSubmitPassword"
          @update:old-password="updateOldPassword"
          @update:new-password="updateNewPassword"
          @update:confirm-password="updateConfirmPassword"
          @submit="changePassword"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/layout/AppHeader.vue'
import PasswordChangeForm from './components/PasswordChangeForm.vue'
import { calculatePasswordStrength } from '@/utils/validation'

const userStore = useUserStore()

// 表单数据
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)
const passwordError = ref(null)
const passwordSuccess = ref(null)

// 密码强度
const passwordStrength = computed(() => calculatePasswordStrength(newPassword.value))

// 密码是否匹配
const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true
  return newPassword.value === confirmPassword.value
})

// 是否可以提交
const canSubmitPassword = computed(() => {
  return oldPassword.value.length >= 6 &&
      newPassword.value.length >= 6 &&
      passwordsMatch.value &&
      !isChangingPassword.value
})

// 更新表单
const updateOldPassword = (val) => {
  oldPassword.value = val
  passwordError.value = null
  passwordSuccess.value = null
}

const updateNewPassword = (val) => {
  newPassword.value = val
  passwordError.value = null
  passwordSuccess.value = null
}

const updateConfirmPassword = (val) => {
  confirmPassword.value = val
  passwordError.value = null
  passwordSuccess.value = null
}

// 修改密码
const changePassword = async () => {
  if (!canSubmitPassword.value) return

  isChangingPassword.value = true
  passwordError.value = null
  passwordSuccess.value = null

  const result = await userStore.changePassword(oldPassword.value, newPassword.value)

  isChangingPassword.value = false

  if (result.success) {
    passwordSuccess.value = result.message || '密码修改成功！'
    // 清空表单
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    // 3秒后清除成功消息
    setTimeout(() => {
      passwordSuccess.value = null
    }, 3000)
  } else {
    passwordError.value = result.message || '修改密码失败'
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
  padding-bottom: 80px;
}

.settings-container {
  padding: 20px 16px;
}
</style>