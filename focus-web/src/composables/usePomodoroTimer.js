import { computed } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoro'

export function usePomodoroTimer() {
    const pomodoroStore = usePomodoroStore()

    const isRunning = computed(() => pomodoroStore.isRunning)
    const isPaused = computed(() => pomodoroStore.isPaused)
    const currentMode = computed(() => pomodoroStore.currentMode)
    const displayTime = computed(() => pomodoroStore.displayTime)
    const statusText = computed(() => pomodoroStore.statusText)
    const progress = computed(() => pomodoroStore.progress)
    const completedSessions = computed(() => pomodoroStore.completedSessions)
    const totalFocusMinutes = computed(() => pomodoroStore.totalFocusMinutes)

    const start = () => pomodoroStore.start()
    const pause = () => pomodoroStore.pause()
    const reset = () => pomodoroStore.reset()
    const skip = () => pomodoroStore.skip()

    return {
        isRunning,
        isPaused,
        currentMode,
        displayTime,
        statusText,
        progress,
        completedSessions,
        totalFocusMinutes,
        start,
        pause,
        reset,
        skip
    }
}