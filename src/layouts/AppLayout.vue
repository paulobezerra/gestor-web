<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  ClipboardList,
  FileText,
  DollarSign,
  Receipt,
  Settings,
  User,
  LogOut,
  Menu,
  Building2,
  Calculator,
  Link2,
  UserCog,
  ChevronDown,
} from 'lucide-vue-next'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import AppLogo from '@/components/AppLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import { useEmpresaStore } from '@/stores/empresa'

const authStore = useAuthStore()
const empresaStore = useEmpresaStore()
const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)
const configOpen = ref(false)

const nomeEmpresa = computed(() => empresaStore.empresa?.nome ?? empresaStore.empresa?.razaoSocial ?? 'Gestor')
const userInitials = computed(() => {
  const email = authStore.user?.email ?? ''
  return email.slice(0, 2).toUpperCase()
})

interface NavItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
  roles?: string[]
  children?: NavItem[]
}

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Agenda', to: '/agenda', icon: Calendar },
    { label: 'Clientes', to: '/clientes', icon: Users },
    { label: 'Serviços', to: '/servicos', icon: Wrench },
    { label: 'OS', to: '/os', icon: ClipboardList },
    { label: 'Orçamentos', to: '/orcamentos', icon: FileText },
  ]

  if (authStore.hasRole('ADMINISTRADOR', 'FINANCEIRO')) {
    items.push({ label: 'Financeiro', to: '/financeiro', icon: DollarSign })
    items.push({ label: 'NFS-e', to: '/nfse', icon: Receipt })
  }

  return items
})

const configItems = computed<NavItem[]>(() => {
  if (!authStore.hasRole('ADMINISTRADOR')) return []
  return [
    { label: 'Empresa', to: '/configuracoes/empresa', icon: Building2 },
    { label: 'Dados Fiscais', to: '/configuracoes/fiscal', icon: Calculator },
    { label: 'Integração Asaas', to: '/configuracoes/asaas', icon: Link2 },
    { label: 'Usuários', to: '/configuracoes/usuarios', icon: UserCog },
  ]
})

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

function logout() {
  authStore.logout()
}

function navigate(to: string) {
  mobileOpen.value = false
  router.push(to)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar desktop -->
    <aside class="hidden w-64 flex-shrink-0 flex-col border-r bg-sidebar md:flex">
      <div class="flex h-16 items-center border-b px-4">
        <AppLogo size="sm" />
      </div>

      <nav class="flex-1 overflow-y-auto p-3" aria-label="Navegação principal">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.to">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              :class="
                isActive(item.to)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              "
              @click="navigate(item.to)"
            >
              <component :is="item.icon" class="size-4 flex-shrink-0" aria-hidden="true" />
              {{ item.label }}
            </button>
          </li>
        </ul>

        <!-- Seção Configurações (ADMINISTRADOR) -->
        <template v-if="configItems.length > 0">
          <Separator class="my-3" />
          <div>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              @click="configOpen = !configOpen"
              :aria-expanded="configOpen"
            >
              <Settings class="size-4 flex-shrink-0" aria-hidden="true" />
              <span class="flex-1 text-left">Configurações</span>
              <ChevronDown
                class="size-3 transition-transform"
                :class="{ 'rotate-180': configOpen }"
                aria-hidden="true"
              />
            </button>
            <ul v-if="configOpen" class="mt-1 space-y-1 pl-4">
              <li v-for="item in configItems" :key="item.to">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                  :class="
                    isActive(item.to)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  "
                  @click="navigate(item.to)"
                >
                  <component :is="item.icon" class="size-4 flex-shrink-0" aria-hidden="true" />
                  {{ item.label }}
                </button>
              </li>
            </ul>
          </div>
        </template>
      </nav>
    </aside>

    <!-- Coluna principal -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex h-16 flex-shrink-0 items-center gap-4 border-b bg-background px-4">
        <!-- Menu hamburguer (mobile) -->
        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="md:hidden" aria-label="Abrir menu">
              <Menu class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-64 p-0">
            <div class="flex h-16 items-center border-b px-4">
              <AppLogo size="sm" />
            </div>
            <nav class="p-3" aria-label="Navegação principal (mobile)">
              <ul class="space-y-1">
                <li v-for="item in navItems" :key="item.to">
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    :class="
                      isActive(item.to)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    "
                    @click="navigate(item.to)"
                  >
                    <component :is="item.icon" class="size-4" aria-hidden="true" />
                    {{ item.label }}
                  </button>
                </li>
              </ul>
              <template v-if="configItems.length > 0">
                <Separator class="my-3" />
                <p class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Configurações
                </p>
                <ul class="space-y-1">
                  <li v-for="item in configItems" :key="item.to">
                    <button
                      type="button"
                      class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                      :class="
                        isActive(item.to)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      "
                      @click="navigate(item.to)"
                    >
                      <component :is="item.icon" class="size-4" aria-hidden="true" />
                      {{ item.label }}
                    </button>
                  </li>
                </ul>
              </template>
            </nav>
          </SheetContent>
        </Sheet>

        <!-- Nome da empresa -->
        <span class="flex-1 truncate text-sm font-medium text-muted-foreground">
          {{ nomeEmpresa }}
        </span>

        <ThemeToggle />

        <!-- Avatar / menu do usuário -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="flex items-center gap-2 px-2" aria-label="Menu do usuário">
              <Avatar class="size-8">
                <AvatarFallback class="text-xs">{{ userInitials }}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <div class="px-3 py-2">
              <p class="text-sm font-medium">{{ authStore.user?.email }}</p>
              <p class="text-xs text-muted-foreground capitalize">{{ authStore.user?.role?.toLowerCase() }}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="navigate('/perfil')">
              <User class="mr-2 size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive focus:text-destructive" @click="logout">
              <LogOut class="mr-2 size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <!-- Conteúdo da página -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
