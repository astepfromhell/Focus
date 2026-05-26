import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
    const router = useRouter()
    const authStore = useAuthStore()

    const isLoggedIn = computed(() => authStore.isLoggedIn)
    const user = computed(() => authStore.user)

    const login = async (email, password, rememberMe) => {
        const result = await authStore.login(email, password, rememberMe)
        if (result.success) {
            router.push('/home')
        }
        return result
    }

    const register = async (username, email, password) => {
        const result = await authStore.register(username, email, password)
        if (result.success) {
            router.push('/home')
        }
        return result
    }

    const logout = async () => {
        await authStore.logout()
        router.push('/login')
    }

    return {
        isLoggedIn,
        user,
        login,
        register,
        logout
    }
}