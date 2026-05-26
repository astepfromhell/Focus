<template>
  <div class="loading-container" :class="{ fullscreen, inline }">
    <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }">
      <div class="spinner-circle"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 40
  },
  text: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(242, 246, 234, 0.8);
  z-index: 1000;
}

.loading-container.inline {
  padding: 32px;
}

.spinner {
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 3px solid #CFDEC4;
  border-top-color: #92A681;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #6A7B6E;
}
</style>