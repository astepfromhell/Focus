import axios from 'axios'

// 获取基础 URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建 axios 实例
const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 添加 Token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 统一处理错误
client.interceptors.response.use(
    (response) => {
        // 统一响应格式: { success, data, message, error }
        const res = response.data
        if (res.success === false) {
            const errorMsg = res.error || res.message || '请求失败'
            return Promise.reject(new Error(errorMsg))
        }
        return res
    },
    (error) => {
        // 网络错误或 HTTP 错误
        if (error.response) {
            const status = error.response.status
            const data = error.response.data

            // 401 未认证，清除本地登录状态
            if (status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user_id')
                window.location.href = '/login'
            }

            const message = data?.error || data?.message || `请求失败 (${status})`
            return Promise.reject(new Error(message))
        }

        if (error.request) {
            return Promise.reject(new Error('网络连接失败，请检查网络'))
        }

        return Promise.reject(error)
    }
)

// 封装 GET 请求
export const get = (url, params = {}) => {
    return client.get(url, { params })
}

// 封装 POST 请求
export const post = (url, data = {}) => {
    return client.post(url, data)
}

// 封装 PUT 请求
export const put = (url, data = {}) => {
    return client.put(url, data)
}

// 封装 DELETE 请求
export const del = (url) => {
    return client.delete(url)
}

// 封装 PATCH 请求
export const patch = (url, data = {}) => {
    return client.patch(url, data)
}

export default client