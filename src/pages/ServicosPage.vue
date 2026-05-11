<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
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
import { Separator } from '@/components/ui/separator'
import {
  listarServicos,
  criarServico,
  atualizarServico,
  alterarStatusServico,
} from '@/api/servicos'
import type { ServicoResp } from '@/types/servico'
import type { ProblemDetail } from '@/types/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const podeEditar = computed(() => authStore.hasRole('ADMINISTRADOR', 'FINANCEIRO'))

// ---------- Listagem ----------
const servicos = ref<ServicoResp[]>([])
const loadingList = ref(false)
const busca = ref('')
const filtroStatus = ref<'todos' | 'ativo' | 'inativo'>('todos')

async function fetchServicos() {
  loadingList.value = true
  try {
    const ativo =
      filtroStatus.value === 'ativo' ? true : filtroStatus.value === 'inativo' ? false : undefined
    const { data } = await listarServicos({ ativo })
    servicos.value = data.content
  } catch {
    toast.error('Erro ao carregar serviços.')
  } finally {
    loadingList.value = false
  }
}

onMounted(fetchServicos)
watch(filtroStatus, fetchServicos)

const filtrados = computed(() => {
  const q = busca.value.toLowerCase()
  if (!q) return servicos.value
  return servicos.value.filter((s) => s.nome.toLowerCase().includes(q))
})

// ---------- Schema do formulário ----------
const schema = toTypedSchema(
  z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    descricao: z.string().optional(),
    precoBase: z
      .number({ invalid_type_error: 'Informe o preço' })
      .positive('Preço deve ser maior que zero'),
    duracaoMinutos: z
      .number({ invalid_type_error: 'Informe a duração' })
      .int()
      .positive('Duração deve ser maior que zero'),
    codigoServico: z.string().optional(),
    cnae: z.string().optional(),
    aliquotaIss: z.number().min(0).max(100).optional(),
  }),
)

// ---------- Criar / Editar ----------
const formOpen = ref(false)
const formLoading = ref(false)
const formError = ref<string | null>(null)
const editandoId = ref<string | null>(null)

const { handleSubmit, resetForm, errors } = useForm({ validationSchema: schema })
const { value: nome } = useField<string>('nome')
const { value: descricao } = useField<string | undefined>('descricao')
const { value: precoBase } = useField<number | undefined>('precoBase')
const { value: duracaoMinutos } = useField<number | undefined>('duracaoMinutos')
const { value: codigoServico } = useField<string | undefined>('codigoServico')
const { value: cnae } = useField<string | undefined>('cnae')
const { value: aliquotaIss } = useField<number | undefined>('aliquotaIss')

function abrirCriar() {
  editandoId.value = null
  resetForm()
  formError.value = null
  formOpen.value = true
}

function abrirEditar(s: ServicoResp) {
  editandoId.value = s.id
  resetForm({
    values: {
      nome: s.nome,
      descricao: s.descricao ?? '',
      precoBase: s.precoBase,
      duracaoMinutos: s.duracaoMinutos,
      codigoServico: s.codigoServico ?? '',
      cnae: s.cnae ?? '',
      aliquotaIss: s.aliquotaIss ?? undefined,
    },
  })
  formError.value = null
  formOpen.value = true
}

const salvarForm = handleSubmit(async (values) => {
  formLoading.value = true
  formError.value = null
  try {
    const payload = {
      nome: values.nome as string,
      descricao: values.descricao || undefined,
      precoBase: values.precoBase as number,
      duracaoMinutos: values.duracaoMinutos as number,
      codigoServico: values.codigoServico || undefined,
      cnae: values.cnae || undefined,
      aliquotaIss: values.aliquotaIss !== undefined ? values.aliquotaIss : undefined,
    }

    if (editandoId.value) {
      await atualizarServico(editandoId.value, payload)
      toast.success('Serviço atualizado.')
    } else {
      await criarServico(payload)
      toast.success('Serviço criado.')
    }
    formOpen.value = false
    await fetchServicos()
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    formError.value = ax.response?.data?.detail ?? 'Erro ao salvar serviço.'
  } finally {
    formLoading.value = false
  }
})

// ---------- Ativar / desativar ----------
const toggleAlertOpen = ref(false)
const toggleTarget = ref<ServicoResp | null>(null)
const toggleLoading = ref(false)

function confirmarToggle(s: ServicoResp) {
  toggleTarget.value = s
  toggleAlertOpen.value = true
}

async function executarToggle() {
  if (!toggleTarget.value) return
  toggleLoading.value = true
  const novoStatus = !toggleTarget.value.ativo
  try {
    await alterarStatusServico(toggleTarget.value.id, { ativo: novoStatus })
    toast.success(novoStatus ? 'Serviço ativado.' : 'Serviço desativado.')
    await fetchServicos()
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    toast.error(ax.response?.data?.detail ?? 'Erro ao alterar status.')
  } finally {
    toggleLoading.value = false
    toggleAlertOpen.value = false
    toggleTarget.value = null
  }
}

// ---------- Helpers ----------
function formatarPreco(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function formatarDuracao(minutos: number) {
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const formTitulo = computed(() => (editandoId.value ? 'Editar serviço' : 'Novo serviço'))
</script>

<template>
  <AppLayout>
    <div class="p-6">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold">Serviços</h1>
        <Button v-if="podeEditar" @click="abrirCriar" data-cy="criar-servico-btn">
          <Plus class="mr-2 size-4" />
          Novo serviço
        </Button>
      </div>

      <!-- Filtros -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative max-w-sm flex-1">
          <Search
            class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            v-model="busca"
            placeholder="Buscar por nome..."
            class="pl-9"
            aria-label="Buscar serviços"
          />
        </div>
        <Select v-model="filtroStatus">
          <SelectTrigger class="w-40" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Tabela -->
      <div class="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço base</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead v-if="podeEditar" class="w-10">
                <span class="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loadingList">
              <TableCell colspan="5" class="text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filtrados.length === 0">
              <TableCell colspan="5" class="text-center text-muted-foreground">
                Nenhum serviço encontrado.
              </TableCell>
            </TableRow>
            <TableRow v-for="s in filtrados" :key="s.id" :data-cy="`servico-row-${s.id}`">
              <TableCell class="font-medium">
                <div>{{ s.nome }}</div>
                <div v-if="s.descricao" class="text-xs text-muted-foreground">{{ s.descricao }}</div>
              </TableCell>
              <TableCell>{{ formatarPreco(s.precoBase) }}</TableCell>
              <TableCell>{{ formatarDuracao(s.duracaoMinutos) }}</TableCell>
              <TableCell>
                <Badge :variant="s.ativo ? 'default' : 'secondary'">
                  {{ s.ativo ? 'Ativo' : 'Inativo' }}
                </Badge>
              </TableCell>
              <TableCell v-if="podeEditar">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" :aria-label="`Ações para ${s.nome}`">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="abrirEditar(s)">Editar</DropdownMenuItem>
                    <DropdownMenuItem @click="confirmarToggle(s)">
                      {{ s.ativo ? 'Desativar' : 'Ativar' }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Dialog: criar / editar -->
      <Dialog v-model:open="formOpen">
        <DialogContent class="max-w-lg">
          <DialogHeader>
            <DialogTitle>{{ formTitulo }}</DialogTitle>
            <DialogDescription>
              Preencha os dados do serviço. Campos fiscais são opcionais e herdam o padrão da
              empresa se não preenchidos.
            </DialogDescription>
          </DialogHeader>

          <form @submit.prevent="salvarForm" class="space-y-4">
            <Alert v-if="formError" variant="destructive" role="alert">
              <AlertDescription>{{ formError }}</AlertDescription>
            </Alert>

            <!-- Dados principais -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="s-nome">Nome <span class="text-destructive">*</span></Label>
                <Input
                  id="s-nome"
                  v-model="nome"
                  placeholder="Ex: Consultoria técnica"
                  :aria-invalid="!!errors.nome"
                  :aria-describedby="errors.nome ? 's-nome-erro' : undefined"
                  data-cy="servico-nome"
                />
                <p v-if="errors.nome" id="s-nome-erro" class="text-sm text-destructive">
                  {{ errors.nome }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="s-descricao">Descrição</Label>
                <Input
                  id="s-descricao"
                  v-model="descricao"
                  placeholder="Breve descrição do serviço"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="s-preco">
                    Preço base (R$) <span class="text-destructive">*</span>
                  </Label>
                  <Input
                    id="s-preco"
                    type="number"
                    step="0.01"
                    min="0.01"
                    v-model.number="precoBase"
                    placeholder="0,00"
                    :aria-invalid="!!errors.precoBase"
                    :aria-describedby="errors.precoBase ? 's-preco-erro' : undefined"
                    data-cy="servico-preco"
                  />
                  <p v-if="errors.precoBase" id="s-preco-erro" class="text-sm text-destructive">
                    {{ errors.precoBase }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="s-duracao">
                    Duração (min) <span class="text-destructive">*</span>
                  </Label>
                  <Input
                    id="s-duracao"
                    type="number"
                    min="1"
                    step="1"
                    v-model.number="duracaoMinutos"
                    placeholder="60"
                    :aria-invalid="!!errors.duracaoMinutos"
                    :aria-describedby="errors.duracaoMinutos ? 's-duracao-erro' : undefined"
                    data-cy="servico-duracao"
                  />
                  <p
                    v-if="errors.duracaoMinutos"
                    id="s-duracao-erro"
                    class="text-sm text-destructive"
                  >
                    {{ errors.duracaoMinutos }}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <!-- Dados fiscais -->
            <div class="space-y-1">
              <p class="text-sm font-medium">Dados fiscais</p>
              <p class="text-xs text-muted-foreground">
                Deixe em branco para herdar o padrão configurado na empresa.
              </p>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="s-codigo">Código de serviço (LC 116)</Label>
                  <Input
                    id="s-codigo"
                    v-model="codigoServico"
                    placeholder="Ex: 1400"
                    data-cy="servico-codigo"
                  />
                </div>

                <div class="space-y-2">
                  <Label for="s-cnae">CNAE</Label>
                  <Input
                    id="s-cnae"
                    v-model="cnae"
                    placeholder="Ex: 7490-1/04"
                    data-cy="servico-cnae"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="s-iss">Alíquota ISS (%)</Label>
                <Input
                  id="s-iss"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  v-model.number="aliquotaIss"
                  placeholder="Ex: 2,5"
                  data-cy="servico-iss"
                />
                <p v-if="errors.aliquotaIss" class="text-sm text-destructive">
                  {{ errors.aliquotaIss }}
                </p>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" @click="formOpen = false">Cancelar</Button>
            <Button
              @click="salvarForm"
              :disabled="formLoading"
              :aria-busy="formLoading"
              data-cy="servico-salvar"
            >
              <span
                v-if="formLoading"
                class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              {{ formLoading ? 'Salvando...' : 'Salvar' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- AlertDialog: confirmar ativar/desativar -->
      <AlertDialog v-model:open="toggleAlertOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {{ toggleTarget?.ativo ? 'Desativar serviço' : 'Ativar serviço' }}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {{
                toggleTarget?.ativo
                  ? `Tem certeza que deseja desativar "${toggleTarget?.nome}"? O serviço não aparecerá em novos agendamentos.`
                  : `Deseja reativar "${toggleTarget?.nome}"?`
              }}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction @click="executarToggle" :disabled="toggleLoading">
              <span
                v-if="toggleLoading"
                class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              {{ toggleTarget?.ativo ? 'Desativar' : 'Ativar' }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </AppLayout>
</template>
