import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Role } from '@/types/colaborador'
import { login as loginApi } from '@/api/auth'
import { REFRESH_TOKEN_KEY } from '@/lib/axios'

interface JwtPayload {
  sub: string
  email: string
  role: Role
  exp: number
}

interface UserInfo {
  id: string
  email: string
  role: Role
}

function decodeJwt(token: string): JwtPayload {
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Token inválido')
  return JSON.parse(atob(payload)) as JwtPayload
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(sessionStorage.getItem('accessToken'))
  const user = ref<UserInfo | null>(null)

  if (accessToken.value) {
    try {
      const payload = decodeJwt(accessToken.value)
      user.value = { id: payload.sub, email: payload.email, role: payload.role }
    } catch {
      accessToken.value = null
      sessionStorage.removeItem('accessToken')
    }
  }

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function setAccessToken(token: string) {
    accessToken.value = token
    sessionStorage.setItem('accessToken', token)
    const payload = decodeJwt(token)
    user.value = { id: payload.sub, email: payload.email, role: payload.role }
  }

  async function login(email: string, senha: string) {
    const { data } = await loginApi({ email, senha })
    setAccessToken(data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  }

  function logout() {
    accessToken.value = null
    user.value = null
    sessionStorage.removeItem('accessToken')
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.location.href = '/login'
  }

  function hasRole(...roles: Role[]): boolean {
    if (!user.value) return false
    return roles.includes(user.value.role)
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    setAccessToken,
    login,
    logout,
    hasRole,
  }
})
