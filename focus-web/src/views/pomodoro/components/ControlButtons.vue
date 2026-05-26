<template>
  <div class="control-buttons">
    <!-- 未开始时显示开始按钮 -->
    <button v-if="!isRunning && !isPaused" class="btn-primary" @click="onStart">
      <span class="btn-icon">▶</span>
      开始
    </button>

    <!-- 运行中显示暂停按钮 -->
    <button v-if="isRunning" class="btn-warning" @click="onPause">
      <span class="btn-icon">⏸</span>
      暂停
    </button>

    <!-- 暂停时显示继续按钮 -->
    <button v-if="isPaused" class="btn-primary" @click="onStart">
      <span class="btn-icon">▶</span>
      继续
    </button>

    <!-- 次要按钮组 -->
    <div v-if="isRunning || isPaused" class="secondary-buttons">
      <button class="btn-secondary" @click="onReset">
        <span class="btn-icon">⟳</span>
        重置
      </button>
      <button v-if="isRunning" class="btn-secondary" @click="onSkip">
        <span class="btn-icon">⏭</span>
        跳过
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isRunning: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start', 'pause', 'reset', 'skip'])

const onStart = () => emit('start')
const onPause = () => emit('pause')
const onReset = () => emit('reset')
const onSkip = () => emit('skip')
</script>

<style scoped>
.control-buttons {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary,
.btn-warning,
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #C3E1AF, #92A681);
  color: white;
  box-shadow: 0 2px 8px rgba(146, 166, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(146, 166, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #FFA726, #F57C00);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 124, 0, 0.3);
}

.btn-warning:hover {
  transform: translateY(-2px);
}

.secondary-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  background: white;
  border: 1px solid #D1D5DB;
  color: #6B7280;
  padding: 12px 16px;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #92A681;
}

.btn-icon {
  font-size: 16px;
}
</style>