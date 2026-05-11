<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench, Calendar, DollarSign, AlertTriangle, Building2, Pencil } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useEmpresaStore } from '@/stores/empresa'

const authStore = useAuthStore()
const empresaStore = useEmpresaStore()
const router = useRouter()

onMounted(async () => {
  if (authStore.hasRole('ADMINISTRADOR')) {
    await empresaStore.fetchEmpresa()
  }
})

const cards = [
  { title: 'OS Abertas', value: 0, icon: Wrench, color: 'text-blue-500' },
  { title: 'Agendamentos Hoje', value: 0, icon: Calendar, color: 'text-green-500' },
  { title: 'Faturamento do Mês', value: 'R$ 0,00', icon: DollarSign, color: 'text-yellow-500' },
  { title: 'Cobranças Vencidas', value: 0, icon: AlertTriangle, color: 'text-red-500' },
]
</script>

<template>
  <AppLayout>
    <div class="p-6">
      <h1 class="mb-6 text-2xl font-bold">Dashboard</h1>

      <!-- Banner Asaas não configurado -->
      <Alert
        v-if="authStore.hasRole('ADMINISTRADOR') && empresaStore.empresa?.statusAsaas === 'NAO_CONFIGURADO'"
        class="mb-6"
        data-cy="banner-asaas"
      >
        <AlertTriangle class="size-4" />
        <AlertTitle>Integração de pagamentos não configurada</AlertTitle>
        <AlertDescription class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Configure a integração Asaas para cobrar seus clientes digitalmente.</span>
          <Button size="sm" @click="router.push('/configuracoes/asaas')">
            Configurar agora
          </Button>
        </AlertDescription>
      </Alert>

      <!-- Card da empresa -->
      <Card v-if="authStore.hasRole('ADMINISTRADOR') && empresaStore.empresa" class="mb-6">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="flex items-center gap-2 text-base">
            <Building2 class="size-4 text-muted-foreground" aria-hidden="true" />
            {{ empresaStore.empresa.razaoSocial ?? empresaStore.empresa.nome }}
          </CardTitle>
          <Button variant="ghost" size="sm" @click="router.push('/configuracoes/empresa')">
            <Pencil class="mr-1 size-3" />
            Editar
          </Button>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          {{ empresaStore.empresa.tipoPessoa === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica' }}
          <span v-if="empresaStore.empresa.cnpj"> · CNPJ {{ empresaStore.empresa.cnpj }}</span>
        </CardContent>
      </Card>

      <!-- Cards de métricas -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card v-for="card in cards" :key="card.title">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">{{ card.title }}</CardTitle>
            <component :is="card.icon" :class="['size-4', card.color]" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ card.value }}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
