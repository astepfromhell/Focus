import { ref, onUnmounted } from 'vue'

export function useDebounce(fn, delay = 300) {
    let timer = null

    const debouncedFn = (...args) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args)
            timer = null
        }, delay)
    }

    onUnmounted(() => {
        if (timer) clearTimeout(timer)
    })

    return debouncedFn
}

export function useDebouncedRef(initialValue, delay = 300) {
    const value = ref(initialValue)
    let timer = null

    const setDebouncedValue = (newValue) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            value.value = newValue
            timer = null
        }, delay)
    }

    onUnmounted(() => {
        if (timer) clearTimeout(timer)
    })

    return { value, setDebouncedValue }
}