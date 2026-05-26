<template>
  <div class="date-range-picker">
    <div class="picker-header">
      <span class="picker-icon">📅</span>
      <span class="picker-title">筛选时间范围</span>
    </div>

    <div class="picker-options">
      <button
          v-for="option in options"
          :key="option.value"
          class="option-chip"
          :class="{ active: selectedRange === option.value }"
          @click="onSelect(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { DATE_RANGE, DATE_RANGE_LABEL } from '@/utils/constants'

const props = defineProps({
  selectedRange: {
    type: String,
    default: DATE_RANGE.WEEK
  }
})

const emit = defineEmits(['change'])

const options = [
  { value: DATE_RANGE.WEEK, label: DATE_RANGE_LABEL[DATE_RANGE.WEEK] },
  { value: DATE_RANGE.MONTH, label: DATE_RANGE_LABEL[DATE_RANGE.MONTH] },
  { value: DATE_RANGE.DAYS_30, label: DATE_RANGE_LABEL[DATE_RANGE.DAYS_30] },
  { value: DATE_RANGE.DAYS_90, label: DATE_RANGE_LABEL[DATE_RANGE.DAYS_90] },
  { value: DATE_RANGE.ALL, label: DATE_RANGE_LABEL[DATE_RANGE.ALL] }
]

const onSelect = (value) => {
  emit('change', value)
}
</script>

<style scoped>
.date-range-picker {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.picker-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.picker-icon {
  font-size: 14px;
}

.picker-title {
  font-size: 14px;
  font-weight: 600;
  color: #2C3E2E;
}

.picker-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.option-chip {
  padding: 8px 16px;
  background: #F5F9F5;
  border: 1px solid #C6D8C3;
  border-radius: 40px;
  font-size: 13px;
  color: #6A7B6E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-chip.active {
  background: #8FBC8F;
  border-color: #8FBC8F;
  color: white;
}

.option-chip:hover:not(.active) {
  background: #E8F5E9;
  border-color: #8FBC8F;
}
</style>