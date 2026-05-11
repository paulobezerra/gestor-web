<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Pencil, X } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { getEmpresaDetalhes, atualizarContatoEndereco } from '@/api/empresa'
import { maskCep, maskTelefone, maskHandler } from '@/composables/useMask'
import type { InquilinoDetalhe } from '@/types/inquilino'
import type { ProblemDetail } from '@/types/api'

const empresa = ref<InquilinoDetalhe | null>(null)
const loading = ref(false)
const editando = ref(false)
const salvando = ref(false)
const apiError = ref<string | null>(null)

async function carregarDados() {
  loading.value = true
  try {
    const { data } = await getEmpresaDetalhes()
    empresa.value = data
  } finally {
    loading.value = false
  }
}

onMounted(carregarDados)

const schema = toTypedSchema(
  z.object({
    email: z.string().email('E-mail inválido'),
    ddd: z.string().length(2, 'DDD inválido'),
    telefone: z.string().regex(/^\d{4,5}-\d{4}$/, 'Telefone inválido'),
    logradouro: z.string().min(1, 'Obrigatório'),
    numero: z.string().min(1, 'Obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Obrigatório'),
    cidade: z.string().min(1, 'Obrigatório'),
    estado: z.string().length(2, 'UF inválida'),
    cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  }),
)

const { handleSubmit, errors, defineField, setValues } = useForm({ validationSchema: schema })
const [email, emailAttrs] = defineField('email')
const [ddd, dddAttrs] = defineField('ddd')
const [telefone, telefoneAttrs] = defineField('telefone')
const [logradouro, logradouroAttrs] = defineField('logradouro')
const [numero, numeroAttrs] = defineField('numero')
const [complemento, complementoAttrs] = defineField('complemento')
const [bairro, bairroAttrs] = defineField('bairro')
const [cidade, cidadeAttrs] = defineField('cidade')
const [estado, estadoAttrs] = defineField('estado')
const [cep, cepAttrs] = defineField('cep')

function iniciarEdicao() {
  if (!empresa.value) return
  const e = empresa.value
  // telefone pode já estar armazenado como dígitos; aplica máscara no display
  const telFormatado = e.telefone.replace(/\D/g, '').length <= 8
    ? e.telefone.replace(/(\d{4})(\d{4})/, '$1-$2')
    : e.telefone.replace(/(\d{5})(\d{4})/, '$1-$2')
  const cepFormatado = e.cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
  setValues({
    email: e.email,
    ddd: e.ddd,
    telefone: telFormatado,
    logradouro: e.logradouro,
    numero: e.numero,
    complemento: e.complemento ?? '',
    bairro: e.bairro,
    cidade: e.cidade,
    estado: e.estado,
    cep: cepFormatado,
  })
  editando.value = true
  apiError.value = null
}

function cancelarEdicao() {
  editando.value = false
  apiError.value = null
}

const onSalvar = handleSubmit(async (v) => {
  salvando.value = true
  apiError.value = null
  try {
    await atualizarContatoEndereco({
      email: v.email,
      ddd: v.ddd,
      telefone: v.telefone.replace(/\D/g, ''),
      logradouro: v.logradouro,
      numero: v.numero,
      complemento: v.complemento,
      bairro: v.bairro,
      cidade: v.cidade,
      estado: v.estado,
      cep: v.cep.replace(/\D/g, ''),
    })
    toast.success('Dados atualizados com sucesso!')
    editando.value = false
    await carregarDados()
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    apiError.value = ax.response?.data?.detail ?? 'Erro ao salvar. Tente novamente.'
  } finally {
    salvando.value = false
  }
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
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Dados da Empresa</h1>
        <Button v-if="!editando && empresa" variant="outline" size="sm" @click="iniciarEdicao">
          <Pencil class="mr-2 size-4" />
          Editar contato e endereço
        </Button>
        <Button v-if="editando" variant="ghost" size="sm" @click="cancelarEdicao">
          <X class="mr-2 size-4" />
          Cancelar
        </Button>
      </div>

      <div v-if="loading" class="text-sm text-muted-foreground">Carregando...</div>

      <template v-else-if="empresa">
        <!-- Dados cadastrais (somente leitura) -->
        <Card class="mb-6">
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>Informações imutáveis do seu negócio</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Nome / Razão Social</Label>
              <p class="font-medium">{{ empresa.razaoSocial ?? empresa.nome }}</p>
            </div>
            <div class="space-y-1">
              <Label class="text-xs text-muted-foreground">Tipo</Label>
              <p>{{ empresa.tipoPessoa === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica' }}</p>
            </div>
            <div v-if="empresa.cnpj" class="space-y-1">
              <Label class="text-xs text-muted-foreground">CNPJ</Label>
              <p>{{ empresa.cnpj }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Label class="text-xs text-muted-foreground">Asaas</Label>
              <Badge :variant="statusAsaasVariant(empresa.statusAsaas)">
                {{ statusAsaasLabel(empresa.statusAsaas) }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Formulário de edição -->
        <form v-if="editando" @submit="onSalvar" novalidate class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div v-if="apiError" class="sm:col-span-2">
                <p class="text-sm text-destructive">{{ apiError }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="e-email">E-mail de contato</Label>
                <Input id="e-email" type="email" v-model="email" v-bind="emailAttrs" :aria-invalid="!!errors.email" />
                <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
              </div>
              <div class="space-y-2">
                <Label for="e-ddd">DDD</Label>
                <Input id="e-ddd" v-model="ddd" v-bind="dddAttrs" placeholder="11" maxlength="2" :aria-invalid="!!errors.ddd" />
                <p v-if="errors.ddd" class="text-sm text-destructive">{{ errors.ddd }}</p>
              </div>
              <div class="space-y-2">
                <Label for="e-telefone">Telefone</Label>
                <Input id="e-telefone" v-model="telefone" v-bind="telefoneAttrs" placeholder="99999-9999" maxlength="10" @input="maskHandler(telefone, maskTelefone)" :aria-invalid="!!errors.telefone" />
                <p v-if="errors.telefone" class="text-sm text-destructive">{{ errors.telefone }}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="e-cep">CEP</Label>
                <Input id="e-cep" v-model="cep" v-bind="cepAttrs" placeholder="00000-000" maxlength="9" @input="maskHandler(cep, maskCep)" :aria-invalid="!!errors.cep" />
                <p v-if="errors.cep" class="text-sm text-destructive">{{ errors.cep }}</p>
              </div>
              <div class="space-y-2">
                <Label for="e-numero">Número</Label>
                <Input id="e-numero" v-model="numero" v-bind="numeroAttrs" :aria-invalid="!!errors.numero" />
                <p v-if="errors.numero" class="text-sm text-destructive">{{ errors.numero }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="e-logradouro">Logradouro</Label>
                <Input id="e-logradouro" v-model="logradouro" v-bind="logradouroAttrs" placeholder="Rua, Av., etc." :aria-invalid="!!errors.logradouro" />
                <p v-if="errors.logradouro" class="text-sm text-destructive">{{ errors.logradouro }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="e-complemento">Complemento <span class="text-muted-foreground">(opcional)</span></Label>
                <Input id="e-complemento" v-model="complemento" v-bind="complementoAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="e-bairro">Bairro</Label>
                <Input id="e-bairro" v-model="bairro" v-bind="bairroAttrs" :aria-invalid="!!errors.bairro" />
                <p v-if="errors.bairro" class="text-sm text-destructive">{{ errors.bairro }}</p>
              </div>
              <div class="space-y-2">
                <Label for="e-cidade">Cidade</Label>
                <Input id="e-cidade" v-model="cidade" v-bind="cidadeAttrs" :aria-invalid="!!errors.cidade" />
                <p v-if="errors.cidade" class="text-sm text-destructive">{{ errors.cidade }}</p>
              </div>
              <div class="space-y-2">
                <Label for="e-estado">Estado (UF)</Label>
                <Input id="e-estado" v-model="estado" v-bind="estadoAttrs" placeholder="SP" maxlength="2" :aria-invalid="!!errors.estado" />
                <p v-if="errors.estado" class="text-sm text-destructive">{{ errors.estado }}</p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" class="w-full" :disabled="salvando" :aria-busy="salvando">
            <span v-if="salvando" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
          </Button>
        </form>

        <!-- Visualização dos dados de contato/endereço -->
        <template v-else>
          <Card class="mb-6">
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="space-y-1">
                <Label class="text-xs text-muted-foreground">E-mail</Label>
                <p>{{ empresa.email }}</p>
              </div>
              <div class="space-y-1">
                <Label class="text-xs text-muted-foreground">Telefone</Label>
                <p>({{ empresa.ddd }}) {{ empresa.telefone }}</p>
              </div>
            </CardContent>
          </Card>

          <Card class="mb-6">
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent class="space-y-1">
              <p>{{ empresa.logradouro }}, {{ empresa.numero }}<span v-if="empresa.complemento"> — {{ empresa.complemento }}</span></p>
              <p>{{ empresa.bairro }} · {{ empresa.cidade }} / {{ empresa.estado }}</p>
              <p class="text-muted-foreground">CEP {{ empresa.cep }}</p>
            </CardContent>
          </Card>
        </template>

        <Separator class="my-6" />

        <div class="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" class="flex-1" @click="$router.push('/configuracoes/fiscal')">
            Dados Fiscais
          </Button>
          <Button variant="outline" class="flex-1" @click="$router.push('/configuracoes/asaas')">
            Integração Asaas
          </Button>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
