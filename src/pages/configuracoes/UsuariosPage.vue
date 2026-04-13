<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Plus, MoreHorizontal, Search } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { listarColaboradores, criarColaborador, atualizarColaborador } from '@/api/colaboradores'
import type { ColaboradorResp, Role } from '@/types/colaborador'
import type { ProblemDetail } from '@/types/api'

const colaboradores = ref<ColaboradorResp[]>([])
const busca = ref('')
const loadingList = ref(false)

async function fetchColaboradores() {
  loadingList.value = true
  try {
    const { data } = await listarColaboradores()
    colaboradores.value = data
  } catch {
    toast.error('Erro ao carregar colaboradores.')
  } finally {
    loadingList.value = false
  }
}

onMounted(fetchColaboradores)

const filtrados = computed(() => {
  const q = busca.value.toLowerCase()
  if (!q) return colaboradores.value
  return colaboradores.value.filter(
    (c) => c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
  )
})

// --- Criar novo ---
const criarOpen = ref(false)
const criarLoading = ref(false)
const criarError = ref<string | null>(null)
const novoNome = ref('')
const novoEmail = ref('')
const novoSenha = ref('')
const novoRole = ref<Role>('TECNICO')

async function criarUsuario() {
  criarLoading.value = true
  criarError.value = null
  try {
    const { data } = await criarColaborador({
      nome: novoNome.value,
      email: novoEmail.value,
      senha: novoSenha.value,
      role: novoRole.value,
    })
    colaboradores.value.push(data)
    criarOpen.value = false
    novoNome.value = ''
    novoEmail.value = ''
    novoSenha.value = ''
    novoRole.value = 'TECNICO'
    toast.success('Usuário criado com sucesso.')
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    criarError.value = ax.response?.data?.detail ?? 'Erro ao criar usuário.'
  } finally {
    criarLoading.value = false
  }
}

// --- Editar role ---
const editarOpen = ref(false)
const editarColaborador = ref<ColaboradorResp | null>(null)
const editarRole = ref<Role>('TECNICO')
const editarLoading = ref(false)
const editarError = ref<string | null>(null)

function abrirEditar(c: ColaboradorResp) {
  editarColaborador.value = c
  editarRole.value = c.role
  editarOpen.value = true
}

async function salvarEdicao() {
  if (!editarColaborador.value) return
  editarLoading.value = true
  editarError.value = null
  try {
    const { data } = await atualizarColaborador(editarColaborador.value.id, {
      role: editarRole.value,
    })
    const idx = colaboradores.value.findIndex((c) => c.id === data.id)
    if (idx !== -1) colaboradores.value[idx] = data
    editarOpen.value = false
    toast.success('Perfil atualizado.')
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    editarError.value = ax.response?.data?.detail ?? 'Erro ao atualizar.'
  } finally {
    editarLoading.value = false
  }
}

// --- Ativar/desativar ---
const toggleAlertOpen = ref(false)
const toggleTarget = ref<ColaboradorResp | null>(null)
const toggleLoading = ref(false)

function confirmarToggle(c: ColaboradorResp) {
  toggleTarget.value = c
  toggleAlertOpen.value = true
}

async function executarToggle() {
  if (!toggleTarget.value) return
  toggleLoading.value = true
  try {
    const { data } = await atualizarColaborador(toggleTarget.value.id, {
      ativo: !toggleTarget.value.ativo,
    })
    const idx = colaboradores.value.findIndex((c) => c.id === data.id)
    if (idx !== -1) colaboradores.value[idx] = data
    toast.success(data.ativo ? 'Usuário ativado.' : 'Usuário desativado.')
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    toast.error(ax.response?.data?.detail ?? 'Erro ao alterar status.')
  } finally {
    toggleLoading.value = false
    toggleAlertOpen.value = false
    toggleTarget.value = null
  }
}

const roleLabels: Record<Role, string> = {
  ADMINISTRADOR: 'Administrador',
  FINANCEIRO: 'Financeiro',
  TECNICO: 'Técnico',
  RECEPCAO: 'Recepção',
}

const roleVariants: Record<Role, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ADMINISTRADOR: 'default',
  FINANCEIRO: 'secondary',
  TECNICO: 'outline',
  RECEPCAO: 'outline',
}

const rolesDisponiveis: Role[] = ['FINANCEIRO', 'TECNICO', 'RECEPCAO']
</script>

<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold">Usuários</h1>
        <Button @click="criarOpen = true">
          <Plus class="mr-2 size-4" />
          Novo usuário
        </Button>
      </div>

      <!-- Busca -->
      <div class="relative mb-4 max-w-sm">
        <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          v-model="busca"
          placeholder="Buscar por nome ou e-mail..."
          class="pl-9"
          aria-label="Buscar usuários"
        />
      </div>

      <!-- Tabela -->
      <div class="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="w-10">
                <span class="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loadingList">
              <TableCell colspan="5" class="text-center text-muted-foreground">Carregando...</TableCell>
            </TableRow>
            <TableRow v-else-if="filtrados.length === 0">
              <TableCell colspan="5" class="text-center text-muted-foreground">Nenhum usuário encontrado.</TableCell>
            </TableRow>
            <TableRow v-for="c in filtrados" :key="c.id">
              <TableCell class="font-medium">{{ c.nome }}</TableCell>
              <TableCell>{{ c.email }}</TableCell>
              <TableCell>
                <Badge :variant="roleVariants[c.role]">{{ roleLabels[c.role] }}</Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="c.ativo ? 'default' : 'secondary'">
                  {{ c.ativo ? 'Ativo' : 'Inativo' }}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" :aria-label="`Ações para ${c.nome}`">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="abrirEditar(c)">Editar perfil</DropdownMenuItem>
                    <DropdownMenuItem @click="confirmarToggle(c)">
                      {{ c.ativo ? 'Desativar' : 'Ativar' }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Dialog: criar usuário -->
      <Dialog v-model:open="criarOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>Preencha os dados do novo colaborador.</DialogDescription>
          </DialogHeader>
          <div class="space-y-4">
            <Alert v-if="criarError" variant="destructive" role="alert">
              <AlertDescription>{{ criarError }}</AlertDescription>
            </Alert>
            <div class="space-y-2">
              <Label for="novo-nome">Nome</Label>
              <Input id="novo-nome" v-model="novoNome" />
            </div>
            <div class="space-y-2">
              <Label for="novo-email">E-mail</Label>
              <Input id="novo-email" type="email" v-model="novoEmail" />
            </div>
            <div class="space-y-2">
              <Label for="novo-senha">Senha inicial</Label>
              <Input id="novo-senha" type="password" v-model="novoSenha" />
            </div>
            <div class="space-y-2">
              <Label for="novo-role">Perfil</Label>
              <Select v-model="novoRole">
                <SelectTrigger id="novo-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="r in rolesDisponiveis" :key="r" :value="r">
                    {{ roleLabels[r] }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="criarOpen = false">Cancelar</Button>
            <Button @click="criarUsuario" :disabled="criarLoading" :aria-busy="criarLoading">
              <span v-if="criarLoading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ criarLoading ? 'Criando...' : 'Criar' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Dialog: editar role -->
      <Dialog v-model:open="editarOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Altere o perfil de acesso de {{ editarColaborador?.nome }}.</DialogDescription>
          </DialogHeader>
          <div class="space-y-4">
            <Alert v-if="editarError" variant="destructive" role="alert">
              <AlertDescription>{{ editarError }}</AlertDescription>
            </Alert>
            <div class="space-y-2">
              <Label for="editar-role">Perfil</Label>
              <Select v-model="editarRole">
                <SelectTrigger id="editar-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="r in rolesDisponiveis" :key="r" :value="r">
                    {{ roleLabels[r] }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="editarOpen = false">Cancelar</Button>
            <Button @click="salvarEdicao" :disabled="editarLoading" :aria-busy="editarLoading">
              <span v-if="editarLoading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ editarLoading ? 'Salvando...' : 'Salvar' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- AlertDialog: confirmar ativar/desativar -->
      <AlertDialog v-model:open="toggleAlertOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {{ toggleTarget?.ativo ? 'Desativar usuário' : 'Ativar usuário' }}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {{ toggleTarget?.ativo
                ? `Tem certeza que deseja desativar ${toggleTarget?.nome}? O usuário não poderá mais acessar o sistema.`
                : `Deseja reativar o acesso de ${toggleTarget?.nome}?` }}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction @click="executarToggle" :disabled="toggleLoading">
              <span v-if="toggleLoading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ toggleTarget?.ativo ? 'Desativar' : 'Ativar' }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </AppLayout>
</template>
