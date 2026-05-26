<template>
  <div id="app" class="app-container">
    <router-view />
    <BottomNavBar v-if="showBottomNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNavBar from '@/components/layout/BottomNavBar.vue'

const route = useRoute()

// 需要显示底部导航的页面
const showBottomNav = computed(() => {
  const hiddenPaths = ['/login', '/register']
  return !hiddenPaths.includes(route.path)
})
</script>

<style>
.app-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F2F6EA 0%, #EAF0E0 100%);
}
</style>