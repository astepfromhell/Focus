<template>
  <div class="empty-tasks">
    <div class="empty-icon">🌼</div>
    <p class="empty-text">暂无今日任务</p>
    <button class="empty-btn" @click="onAddTask">添加第一个任务</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['add-task'])

const onAddTask = () => {
  emit('add-task')
}
</script>

<style scoped>
.empty-tasks {
  background: white;
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 24px;
}

.empty-btn {
  padding: 10px 24px;
  background: #667EEA;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-btn:hover {
  background: #5A67D8;
  transform: translateY(-2px);
}
</style>