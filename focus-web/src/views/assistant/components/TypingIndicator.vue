<template>
  <div class="typing-indicator">
    <div class="typing-avatar">🌱</div>
    <div class="typing-bubble">
      <div class="dot dot-1"></div>
      <div class="dot dot-2"></div>
      <div class="dot dot-3"></div>
    </div>
  </div>
</template>

<script setup>
// AI 正在输入的三点动画指示器
</script>

<style scoped>
.typing-indicator {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  align-items: flex-end;
}

.typing-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #8BC34A, #689F38);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.typing-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: #8BC34A;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.dot-1 {
  animation-delay: -0.32s;
}

.dot-2 {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>