import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    // 认证页面
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { requiresAuth: false }
    },
    // 主页面
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/HomeView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/assistant',
        name: 'Assistant',
        component: () => import('@/views/assistant/AssistantView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/pomodoro',
        name: 'Pomodoro',
        component: () => import('@/views/pomodoro/PomodoroView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('@/views/tasks/TasksView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/notes',
        name: 'Notes',
        component: () => import('@/views/notes/NotesView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/note/:id',
        name: 'NoteDetail',
        component: () => import('@/views/notes/NoteDetailView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/StatisticsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const isLoggedIn = authStore.isLoggedIn

    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
        next('/home')
    } else {
        next()
    }
})

export default router