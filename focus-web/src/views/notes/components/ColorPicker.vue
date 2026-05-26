<template>
  <div class="color-picker">
    <div class="color-picker-header">
      <span class="color-picker-icon">🎨</span>
      <span class="color-picker-title">便签颜色</span>
    </div>
    <div class="color-grid">
      <button
          v-for="color in colors"
          :key="color.hex"
          class="color-option"
          :style="{ backgroundColor: color.hex }"
          :class="{ active: selectedColor === color.hex }"
          @click="selectColor(color.hex)"
      >
        <span v-if="selectedColor === color.hex" class="check-mark">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { NOTE_COLORS } from '@/utils/constants'

const props = defineProps({
  selectedColor: {
    type: String,
    default: '#fffab3'
  }
})

const emit = defineEmits(['update:selectedColor', 'select'])

const colors = NOTE_COLORS

const selectColor = (hex) => {
  emit('update:selectedColor', hex)
  emit('select', hex)
}
</script>

<style scoped>
.color-picker {
  padding: 12px 0;
}

.color-picker-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.color-picker-icon {
  font-size: 14px;
}

.color-picker-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-option {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option.active {
  border-color: #374151;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.check-mark {
  font-size: 20px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
  text-shadow: 0 0 2px white;
}
</style>