<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AxiosError } from 'axios'
import { Eye, EyeOff, CheckCircle2, XCircle, MinusCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { getAsaasStatus, salvarAsaasKey } from '@/api/empresa'
import type { StatusAsaas } from '@/types/inquilino'
import type { ProblemDetail } from '@/types/api'

const status = ref<StatusAsaas>('NAO_CONFIGURADO')
const apiKey = ref('')
const showKey = ref(false)
const loading = ref(false)
const loadingStatus = ref(true)
const apiError = ref<string | null>(null)

onMounted(async () => {
  loadingStatus.value = true
  try {
    const { data } = await getAsaasStatus()
    status.value = data.status
  } catch {
    // ignora
  } finally {
    loadingStatus.value = false
  }
})

async function testarESalvar() {
  if (!apiKey.value.trim()) return
  loading.value = true
  apiError.value = null
  try {
    const { data } = await salvarAsaasKey({ apiKey: apiKey.value.trim() })
    status.value = data.status
    if (data.status === 'CONFIGURADO') {
      toast.success('Integração Asaas configurada com sucesso!')
    }
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    apiError.value = ax.response?.data?.detail ?? 'Erro ao configurar. Verifique a chave.'
    status.value = 'ERRO'
  } finally {
    loading.value = false
  }
}

const statusConfig = {
  CONFIGURADO: {
    label: 'Configurado',
    variant: 'default' as const,
    icon: CheckCircle2,
    class: 'text-green-600',
  },
  ERRO: {
    label: 'Erro',
    variant: 'destructive' as const,
    icon: XCircle,
    class: 'text-destructive',
  },
  NAO_CONFIGURADO: {
    label: 'Não configurado',
    variant: 'secondary' as const,
    icon: MinusCircle,
    class: 'text-muted-foreground',
  },
}
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-2xl p-6">
      <h1 class="mb-6 text-2xl font-bold">Integração Asaas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Status da integração</CardTitle>
          <CardDescription>
            Configure sua chave de API Asaas para cobranças digitais
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Status atual -->
          <div v-if="loadingStatus" class="text-sm text-muted-foreground">Verificando status...</div>
          <div v-else class="flex items-center gap-3">
            <component
              :is="statusConfig[status].icon"
              :class="['size-6', statusConfig[status].class]"
              aria-hidden="true"
            />
            <Badge :variant="statusConfig[status].variant">
              {{ statusConfig[status].label }}
            </Badge>
          </div>

          <Alert v-if="status === 'ERRO'" variant="destructive" role="alert">
            <AlertDescription>
              A chave Asaas está inválida ou expirou. Insira uma nova chave de API.
            </AlertDescription>
          </Alert>

          <Alert v-if="apiError" variant="destructive" role="alert">
            <AlertDescription>{{ apiError }}</AlertDescription>
          </Alert>

          <!-- Campo da chave -->
          <div class="space-y-2">
            <Label for="asaas-key">Chave de API Asaas</Label>
            <div class="relative">
              <Input
                id="asaas-key"
                :type="showKey ? 'text' : 'password'"
                v-model="apiKey"
                placeholder="$aact_..."
                class="pr-10"
                autocomplete="off"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                @click="showKey = !showKey"
                :aria-label="showKey ? 'Ocultar chave' : 'Mostrar chave'"
              >
                <EyeOff v-if="showKey" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <Button
            type="button"
            :disabled="loading || !apiKey.trim()"
            :aria-busy="loading"
            @click="testarESalvar"
          >
            <span v-if="loading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ loading ? 'Verificando...' : 'Testar e salvar' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
