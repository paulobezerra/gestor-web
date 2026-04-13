import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/colaborador'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirect raiz
    {
      path: '/',
      redirect: '/dashboard',
    },

    // Rotas públicas
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('@/pages/RegistroPage.vue'),
      meta: { public: true },
    },
    {
      path: '/recuperar-senha',
      name: 'recuperar-senha',
      component: () => import('@/pages/RecuperarSenhaPage.vue'),
      meta: { public: true },
    },
    {
      path: '/redefinir-senha',
      name: 'redefinir-senha',
      component: () => import('@/pages/RedefinirSenhaPage.vue'),
      meta: { public: true },
    },

    // Rotas autenticadas
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/pages/PerfilPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agenda',
      name: 'agenda',
      component: () => import('@/pages/AgendaPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('@/pages/ClientesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/servicos',
      name: 'servicos',
      component: () => import('@/pages/ServicosPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/os',
      name: 'os',
      component: () => import('@/pages/OsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orcamentos',
      name: 'orcamentos',
      component: () => import('@/pages/OrcamentosPage.vue'),
      meta: { requiresAuth: true },
    },

    // Rotas ADMINISTRADOR | FINANCEIRO
    {
      path: '/financeiro',
      name: 'financeiro',
      component: () => import('@/pages/FinanceiroPage.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'FINANCEIRO'] as Role[] },
    },
    {
      path: '/nfse',
      name: 'nfse',
      component: () => import('@/pages/NfsePage.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'FINANCEIRO'] as Role[] },
    },

    // Rotas ADMINISTRADOR — Configurações
    {
      path: '/configuracoes/empresa',
      name: 'configuracoes-empresa',
      component: () => import('@/pages/configuracoes/EmpresaPage.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] as Role[] },
    },
    {
      path: '/configuracoes/fiscal',
      name: 'configuracoes-fiscal',
      component: () => import('@/pages/configuracoes/FiscalPage.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] as Role[] },
    },
    {
      path: '/configuracoes/asaas',
      name: 'configuracoes-asaas',
      component: () => import('@/pages/configuracoes/AsaasPage.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] as Role[] },
    },
    {
      path: '/configuracoes/usuarios',
      name: 'configuracoes-usuarios',
      component: () => import('@/pages/configuracoes/UsuariosPage.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] as Role[] },
    },
  ],
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()

  const isPublic = to.meta.public === true
  const requiresAuth = to.meta.requiresAuth === true
  const requiredRoles = to.meta.roles as Role[] | undefined

  if (isPublic && authStore.isAuthenticated) {
    return '/dashboard'
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (requiresAuth && requiredRoles && requiredRoles.length > 0) {
    if (!authStore.hasRole(...requiredRoles)) {
      return '/dashboard'
    }
  }

  return true
})

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiresAuth?: boolean
    roles?: Role[]
  }
}

export default router
