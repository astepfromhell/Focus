<template>
  <div class="auth-form-group">
    <div class="input-wrapper" :class="{ error: hasError, focused: isFocused }">
      <span class="input-icon">{{ icon }}</span>
      <input
          :type="inputType"
          :value="modelValue"
          :placeholder="placeholder"
          class="auth-input"
          @input="handleInput"
          @focus="isFocused = true"
          @blur="isFocused = false"
      />
      <button
          v-if="type === 'password'"
          type="button"
          class="input-toggle"
          @click="toggleVisibility"
      >
        {{ showPassword ? '🙈' : '👁️' }}
      </button>
    </div>
    <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
    <div v-if="strength && modelValue" class="password-strength">
      <div class="strength-bar">
        <div class="strength-fill" :class="strength.class" :style="{ width: strength.progress + '%' }"></div>
      </div>
      <span class="strength-label" :class="strength.class">{{ strength.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text' // text, email, password
  },
  placeholder: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  strength: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)
const showPassword = ref(false)

const hasError = computed(() => !!props.errorMessage)
const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text'
  return props.type
})

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const toggleVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.auth-form-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.input-wrapper.focused {
  border-color: #92A681;
  background: white;
  box-shadow: 0 0 0 3px rgba(146, 166, 129, 0.1);
}

.input-wrapper.error {
  border-color: #DC2626;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
}

.auth-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
}

.auth-input::placeholder {
  color: #9CA3AF;
}

.input-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
}

.auth-error {
  font-size: 12px;
  color: #DC2626;
  margin-top: 6px;
  padding-left: 12px;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-left: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
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
</style>