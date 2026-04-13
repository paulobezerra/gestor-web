<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useEmpresaStore } from '@/stores/empresa'

const empresaStore = useEmpresaStore()
const router = useRouter()

onMounted(() => {
  empresaStore.fetchEmpresa()
})

function statusAsaasLabel(status: string) {
  const map: Record<string, string> = {
    CONFIGURADO: 'Configurado',
    ERRO: 'Erro',
    NAO_CONFIGURADO: 'Não configurado',
  }
  return map[status] ?? status
}

function statusAsaasVariant(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (status === 'CONFIGURADO') return 'default'
  if (status === 'ERRO') return 'destructive'
  return 'secondary'
}
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-2xl p-6">
      <h1 class="mb-6 text-2xl font-bold">Configurações da Empresa</h1>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
          <CardDescription>Informações do seu negócio registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="empresaStore.loading" class="text-sm text-muted-foreground">Carregando...</div>
          <template v-else-if="empresaStore.empresa">
            <div class="space-y-2">
              <Label>Nome / Razão Social</Label>
              <Input :value="empresaStore.empresa.razaoSocial ?? empresaStore.empresa.nome" readonly aria-readonly="true" />
            </div>
            <div class="space-y-2">
              <Label>Tipo de pessoa</Label>
              <Input
                :value="empresaStore.empresa.tipoPessoa === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'"
                readonly
                aria-readonly="true"
              />
            </div>
            <div v-if="empresaStore.empresa.cnpj" class="space-y-2">
              <Label>CNPJ</Label>
              <Input :value="empresaStore.empresa.cnpj" readonly aria-readonly="true" />
            </div>
            <div class="flex items-center gap-3">
              <Label>Integração Asaas</Label>
              <Badge :variant="statusAsaasVariant(empresaStore.empresa.statusAsaas)">
                {{ statusAsaasLabel(empresaStore.empresa.statusAsaas) }}
              </Badge>
            </div>
          </template>
        </CardContent>
      </Card>

      <Separator class="my-6" />

      <div class="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" class="flex-1" @click="router.push('/configuracoes/fiscal')">
          Dados Fiscais
        </Button>
        <Button variant="outline" class="flex-1" @click="router.push('/configuracoes/asaas')">
          Integração Asaas
        </Button>
      </div>
    </div>
  </AppLayout>
</template>
