import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ProblemDetail } from '@/types/api'

const REFRESH_TOKEN_KEY = 'refreshToken'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
})

// Lazy import da store para evitar circular dependency
function getAuthStore() {
  // Importação dinâmica dentro da função para evitar circular
  return import('@/stores/auth').then((m) => m.useAuthStore())
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetail>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        isRefreshing = false
        redirectToLogin()
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/v1/auth/renovar-token`,
          { refreshToken },
        )

        const newToken: string = data.accessToken
        sessionStorage.setItem('accessToken', newToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)

        const authStore = await getAuthStore()
        authStore.setAccessToken(newToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        sessionStorage.removeItem('accessToken')
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function redirectToLogin() {
  window.location.href = '/login'
}

export default api
export { REFRESH_TOKEN_KEY }
