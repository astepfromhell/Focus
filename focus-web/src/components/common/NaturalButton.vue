<template>
  <button
      class="natural-btn"
      :class="[
      `natural-btn-${variant}`,
      { 'natural-btn-loading': loading, 'natural-btn-disabled': disabled }
    ]"
      :disabled="disabled || loading"
      @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">
      <span class="loading-spinner"></span>
    </span>
    <template v-else>
      <span v-if="emoji" class="btn-emoji">{{ emoji }}</span>
      <span class="btn-text">{{ text }}</span>
      <span v-if="showArrow" class="btn-arrow">→</span>
    </template>
  </button>
</template>

<script setup>
const props = defineProps({
  emoji: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, text
    validator: (val) => ['primary', 'secondary', 'outline', 'text'].includes(val)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showArrow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (e) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
  }
}
</script>

<style scoped>
.natural-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 32px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  width: 100%;
}

.natural-btn-primary {
  background: linear-gradient(135deg, #92A681, #7A9A6A);
  color: white;
  box-shadow: 0 2px 8px rgba(146, 166, 129, 0.3);
}

.natural-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(146, 166, 129, 0.4);
}

.natural-btn-secondary {
  background: #E8F5E9;
  color: #2E7D32;
}

.natural-btn-secondary:hover:not(:disabled) {
  background: #DCF0DE;
}

.natural-btn-outline {
  background: white;
  border: 1px solid #CFDEC4;
  color: #7A9A6A;
}

.natural-btn-outline:hover:not(:disabled) {
  background: #F5F8EF;
  border-color: #92A681;
}

.natural-btn-text {
  background: transparent;
  color: #92A681;
  padding: 8px 16px;
}

.natural-btn-text:hover:not(:disabled) {
  background: rgba(146, 166, 129, 0.1);
}

.natural-btn-loading,
.natural-btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-emoji {
  font-size: 18px;
}

.btn-text {
  font-size: 16px;
}

.btn-arrow {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.natural-btn:hover:not(:disabled) .btn-arrow {
  transform: translateX(4px);
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.natural-btn-secondary .loading-spinner,
.natural-btn-outline .loading-spinner,
.natural-btn-text .loading-spinner {
  border: 2px solid rgba(122, 154, 106, 0.3);
  border-top-color: #7A9A6A;
}
</style>