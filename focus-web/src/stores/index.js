import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store 方便使用
export { useAuthStore } from './auth'
export { useUserStore } from './user'
export { usePomodoroStore } from './pomodoro'
export { useNoteStore } from './note'
export { useTaskStore } from './task'
export { useAiStore } from './ai'