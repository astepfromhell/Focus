<template>
  <div v-if="strength && strength.label" class="strength-indicator">
    <div class="strength-bar">
      <div
          class="strength-fill"
          :class="strengthClass"
          :style="{ width: strength.progress + '%' }"
      ></div>
    </div>
    <span class="strength-label" :class="strengthClass">{{ strength.label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  strength: {
    type: Object,
    default: () => ({ label: '', class: '', progress: 0 })
  }
})

const strengthClass = computed(() => {
  const cls = props.strength.class || props.strength.strength?.toLowerCase()
  if (cls === 'weak') return 'weak'
  if (cls === 'medium') return 'medium'
  if (cls === 'strong') return 'strong'
  return ''
})
</script>

<style scoped>
.strength-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
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
  border-radius: 2px;
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