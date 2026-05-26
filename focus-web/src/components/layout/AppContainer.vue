<template>
  <div class="app-container" :class="{ 'no-padding': noPadding }">
    <div class="container-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  noPadding: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
}

.container-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px 80px 16px;
}

.app-container.no-padding .container-inner {
  padding: 0 0 80px 0;
}
</style>