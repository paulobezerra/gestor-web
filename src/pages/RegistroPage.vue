<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-vue-next'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { criarUsuario } from '@/api/usuario'
import { criarPessoaFisica, criarPessoaJuridica } from '@/api/inquilino'
import { useAuthStore } from '@/stores/auth'
import type { ProblemDetail } from '@/types/api'
import type { RegimeTributario } from '@/types/inquilino'

const router = useRouter()
const authStore = useAuthStore()
const step = ref(1)

// Dados do passo 1 (guardados para uso no login automático)
const dadosAcesso = ref({ email: '', senha: '' })

// --- Passo 1: Dados de acesso ---
const schemaStep1 = toTypedSchema(
  z
    .object({
      email: z.string().email('E-mail inválido'),
      senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
      confirmacao: z.string(),
    })
    .refine((d) => d.senha === d.confirmacao, {
      message: 'As senhas não coincidem',
      path: ['confirmacao'],
    }),
)

const form1 = useForm({ validationSchema: schemaStep1 })
const [email1, email1Attrs] = form1.defineField('email')
const [senha1, senha1Attrs] = form1.defineField('senha')
const [conf1, conf1Attrs] = form1.defineField('confirmacao')

const loading1 = ref(false)
const error1 = ref<string | null>(null)
const showSenha1 = ref(false)
const showConf1 = ref(false)

const onStep1 = form1.handleSubmit(async (values) => {
  loading1.value = true
  error1.value = null
  try {
    await criarUsuario({ email: values.email, senha: values.senha })
    dadosAcesso.value = { email: values.email, senha: values.senha }
    step.value = 2
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    error1.value = ax.response?.data?.detail ?? 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading1.value = false
  }
})

// --- Passo 2: Dados da empresa ---
type TipoPessoaLocal = 'FISICA' | 'JURIDICA'
const tipoPessoa = ref<TipoPessoaLocal>('FISICA')

const regimesOptions: { value: RegimeTributario; label: string }[] = [
  { value: 'MEI', label: 'MEI' },
  { value: 'SIMPLES', label: 'Simples Nacional' },
  { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
  { value: 'LUCRO_REAL', label: 'Lucro Real' },
  { value: 'NAO_TRIBUTADO', label: 'Não Tributado' },
]

// Schema pessoa física
const schemaFisica = toTypedSchema(
  z.object({
    nome: z.string().min(2, 'Nome obrigatório'),
    cpf: z.string().min(11, 'CPF inválido'),
    rg: z.string().min(5, 'RG inválido'),
    inscricaoMunicipal: z.string().min(1, 'Obrigatório'),
    ddd: z.string().length(2, 'DDD inválido'),
    telefone: z.string().min(8, 'Telefone inválido'),
    emailContato: z.string().email('E-mail inválido'),
    cep: z.string().min(8, 'CEP inválido'),
    logradouro: z.string().min(1, 'Obrigatório'),
    numero: z.string().min(1, 'Obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Obrigatório'),
    cidade: z.string().min(1, 'Obrigatório'),
    estado: z.string().length(2, 'UF inválida'),
  }),
)

// Schema pessoa jurídica
const schemaJuridica = toTypedSchema(
  z.object({
    razaoSocial: z.string().min(2, 'Obrigatório'),
    nomeFantasia: z.string().min(2, 'Obrigatório'),
    cnpj: z.string().min(14, 'CNPJ inválido'),
    regimeTributario: z.enum(['MEI', 'SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'NAO_TRIBUTADO']),
    inscricaoMunicipal: z.string().min(1, 'Obrigatório'),
    // Representante
    repNome: z.string().min(2, 'Obrigatório'),
    repCpf: z.string().min(11, 'CPF inválido'),
    repRg: z.string().min(5, 'RG inválido'),
    repDdd: z.string().length(2, 'DDD inválido'),
    repTelefone: z.string().min(8, 'Telefone inválido'),
    repEmail: z.string().email('E-mail inválido'),
    repCep: z.string().min(8, 'CEP inválido'),
    repLogradouro: z.string().min(1, 'Obrigatório'),
    repNumero: z.string().min(1, 'Obrigatório'),
    repComplemento: z.string().optional(),
    repBairro: z.string().min(1, 'Obrigatório'),
    repCidade: z.string().min(1, 'Obrigatório'),
    repEstado: z.string().length(2, 'UF inválida'),
    // Contato empresa
    ddd: z.string().length(2, 'DDD inválido'),
    telefone: z.string().min(8, 'Telefone inválido'),
    emailContato: z.string().email('E-mail inválido'),
    // Endereço empresa
    cep: z.string().min(8, 'CEP inválido'),
    logradouro: z.string().min(1, 'Obrigatório'),
    numero: z.string().min(1, 'Obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Obrigatório'),
    cidade: z.string().min(1, 'Obrigatório'),
    estado: z.string().length(2, 'UF inválida'),
  }),
)

const formFisica = useForm({ validationSchema: schemaFisica })
const formJuridica = useForm({ validationSchema: schemaJuridica })

const [fNome, fNomeAttrs] = formFisica.defineField('nome')
const [fCpf, fCpfAttrs] = formFisica.defineField('cpf')
const [fRg, fRgAttrs] = formFisica.defineField('rg')
const [fInscricao, fInscricaoAttrs] = formFisica.defineField('inscricaoMunicipal')
const [fDdd, fDddAttrs] = formFisica.defineField('ddd')
const [fTelefone, fTelefoneAttrs] = formFisica.defineField('telefone')
const [fEmail, fEmailAttrs] = formFisica.defineField('emailContato')
const [fCep, fCepAttrs] = formFisica.defineField('cep')
const [fLogradouro, fLogradouroAttrs] = formFisica.defineField('logradouro')
const [fNumero, fNumeroAttrs] = formFisica.defineField('numero')
const [fComplemento, fComplementoAttrs] = formFisica.defineField('complemento')
const [fBairro, fBairroAttrs] = formFisica.defineField('bairro')
const [fCidade, fCidadeAttrs] = formFisica.defineField('cidade')
const [fEstado, fEstadoAttrs] = formFisica.defineField('estado')

const [jRazao, jRazaoAttrs] = formJuridica.defineField('razaoSocial')
const [jFantasia, jFantasiaAttrs] = formJuridica.defineField('nomeFantasia')
const [jCnpj, jCnpjAttrs] = formJuridica.defineField('cnpj')
const [jRegime, jRegimeAttrs] = formJuridica.defineField('regimeTributario')
const [jInscricao, jInscricaoAttrs] = formJuridica.defineField('inscricaoMunicipal')
const [jRepNome, jRepNomeAttrs] = formJuridica.defineField('repNome')
const [jRepCpf, jRepCpfAttrs] = formJuridica.defineField('repCpf')
const [jRepRg, jRepRgAttrs] = formJuridica.defineField('repRg')
const [jRepDdd, jRepDddAttrs] = formJuridica.defineField('repDdd')
const [jRepTelefone, jRepTelefoneAttrs] = formJuridica.defineField('repTelefone')
const [jRepEmail, jRepEmailAttrs] = formJuridica.defineField('repEmail')
const [jRepCep, jRepCepAttrs] = formJuridica.defineField('repCep')
const [jRepLogradouro, jRepLogradouroAttrs] = formJuridica.defineField('repLogradouro')
const [jRepNumero, jRepNumeroAttrs] = formJuridica.defineField('repNumero')
const [jRepComplemento, jRepComplementoAttrs] = formJuridica.defineField('repComplemento')
const [jRepBairro, jRepBairroAttrs] = formJuridica.defineField('repBairro')
const [jRepCidade, jRepCidadeAttrs] = formJuridica.defineField('repCidade')
const [jRepEstado, jRepEstadoAttrs] = formJuridica.defineField('repEstado')
const [jDdd, jDddAttrs] = formJuridica.defineField('ddd')
const [jTelefone, jTelefoneAttrs] = formJuridica.defineField('telefone')
const [jEmail, jEmailAttrs] = formJuridica.defineField('emailContato')
const [jCep, jCepAttrs] = formJuridica.defineField('cep')
const [jLogradouro, jLogradouroAttrs] = formJuridica.defineField('logradouro')
const [jNumero, jNumeroAttrs] = formJuridica.defineField('numero')
const [jComplemento, jComplementoAttrs] = formJuridica.defineField('complemento')
const [jBairro, jBairroAttrs] = formJuridica.defineField('bairro')
const [jCidade, jCidadeAttrs] = formJuridica.defineField('cidade')
const [jEstado, jEstadoAttrs] = formJuridica.defineField('estado')

const loading2 = ref(false)
const error2 = ref<string | null>(null)

const onStep2Fisica = formFisica.handleSubmit(async (v) => {
  loading2.value = true
  error2.value = null
  try {
    await criarPessoaFisica({
      emailUsuario: dadosAcesso.value.email,
      nome: v.nome,
      cpf: v.cpf,
      rg: v.rg,
      inscricaoMunicipal: v.inscricaoMunicipal,
      contato: { ddd: v.ddd, telefone: v.telefone, email: v.emailContato },
      endereco: {
        logradouro: v.logradouro,
        numero: v.numero,
        complemento: v.complemento,
        bairro: v.bairro,
        cidade: v.cidade,
        estado: v.estado,
        cep: v.cep,
      },
    })
    await authStore.login(dadosAcesso.value.email, dadosAcesso.value.senha)
    router.push('/dashboard')
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    error2.value = ax.response?.data?.detail ?? 'Erro ao criar empresa. Tente novamente.'
  } finally {
    loading2.value = false
  }
})

const onStep2Juridica = formJuridica.handleSubmit(async (v) => {
  loading2.value = true
  error2.value = null
  try {
    await criarPessoaJuridica({
      emailUsuario: dadosAcesso.value.email,
      razaoSocial: v.razaoSocial,
      nomeFantasia: v.nomeFantasia,
      cnpj: v.cnpj,
      regimeTributario: v.regimeTributario as RegimeTributario,
      inscricaoMunicipal: v.inscricaoMunicipal,
      representante: {
        nome: v.repNome,
        cpf: v.repCpf,
        rg: v.repRg,
        contato: { ddd: v.repDdd, telefone: v.repTelefone, email: v.repEmail },
        endereco: {
          logradouro: v.repLogradouro,
          numero: v.repNumero,
          complemento: v.repComplemento,
          bairro: v.repBairro,
          cidade: v.repCidade,
          estado: v.repEstado,
          cep: v.repCep,
        },
      },
      contato: { ddd: v.ddd, telefone: v.telefone, email: v.emailContato },
      endereco: {
        logradouro: v.logradouro,
        numero: v.numero,
        complemento: v.complemento,
        bairro: v.bairro,
        cidade: v.cidade,
        estado: v.estado,
        cep: v.cep,
      },
    })
    await authStore.login(dadosAcesso.value.email, dadosAcesso.value.senha)
    router.push('/dashboard')
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    error2.value = ax.response?.data?.detail ?? 'Erro ao criar empresa. Tente novamente.'
  } finally {
    loading2.value = false
  }
})
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <div class="mb-4 flex items-center gap-2">
          <div
            v-for="s in [1, 2]"
            :key="s"
            class="flex size-7 items-center justify-center rounded-full text-xs font-bold"
            :class="
              step === s
                ? 'bg-primary text-primary-foreground'
                : step > s
                  ? 'bg-primary/30 text-primary'
                  : 'bg-muted text-muted-foreground'
            "
            :aria-current="step === s ? 'step' : undefined"
          >
            {{ s }}
          </div>
          <div class="h-px flex-1 bg-border" />
        </div>
        <CardTitle>{{ step === 1 ? 'Criar conta' : 'Dados da empresa' }}</CardTitle>
        <CardDescription>
          {{ step === 1 ? 'Defina seu e-mail e senha de acesso' : 'Informe os dados do seu negócio' }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- PASSO 1 -->
        <form v-if="step === 1" @submit="onStep1" novalidate class="space-y-4">
          <Alert v-if="error1" variant="destructive" class="mb-4" role="alert">
            <AlertDescription>{{ error1 }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="email1">E-mail</Label>
            <Input id="email1" type="email" v-model="email1" v-bind="email1Attrs" placeholder="voce@exemplo.com" autocomplete="email" :aria-invalid="!!form1.errors.value.email" />
            <p v-if="form1.errors.value.email" class="text-sm text-destructive" role="alert">{{ form1.errors.value.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="senha1">Senha</Label>
            <div class="relative">
              <Input id="senha1" :type="showSenha1 ? 'text' : 'password'" v-model="senha1" v-bind="senha1Attrs" placeholder="Mínimo 8 caracteres" autocomplete="new-password" class="pr-10" :aria-invalid="!!form1.errors.value.senha" />
              <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground" @click="showSenha1 = !showSenha1" :aria-label="showSenha1 ? 'Ocultar senha' : 'Mostrar senha'">
                <EyeOff v-if="showSenha1" class="size-4" /><Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="form1.errors.value.senha" class="text-sm text-destructive" role="alert">{{ form1.errors.value.senha }}</p>
          </div>

          <div class="space-y-2">
            <Label for="conf1">Confirmar senha</Label>
            <div class="relative">
              <Input id="conf1" :type="showConf1 ? 'text' : 'password'" v-model="conf1" v-bind="conf1Attrs" placeholder="Repita a senha" autocomplete="new-password" class="pr-10" :aria-invalid="!!form1.errors.value.confirmacao" />
              <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground" @click="showConf1 = !showConf1" :aria-label="showConf1 ? 'Ocultar confirmação' : 'Mostrar confirmação'">
                <EyeOff v-if="showConf1" class="size-4" /><Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="form1.errors.value.confirmacao" class="text-sm text-destructive" role="alert">{{ form1.errors.value.confirmacao }}</p>
          </div>

          <Button type="submit" class="w-full" :disabled="loading1" :aria-busy="loading1">
            <span v-if="loading1" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ loading1 ? 'Criando conta...' : 'Próximo' }}
          </Button>
        </form>

        <!-- PASSO 2 -->
        <div v-else>
          <!-- Seletor tipo de pessoa -->
          <div class="mb-6 flex gap-2">
            <Button
              type="button"
              :variant="tipoPessoa === 'FISICA' ? 'default' : 'outline'"
              class="flex-1"
              @click="tipoPessoa = 'FISICA'"
            >
              Pessoa Física
            </Button>
            <Button
              type="button"
              :variant="tipoPessoa === 'JURIDICA' ? 'default' : 'outline'"
              class="flex-1"
              @click="tipoPessoa = 'JURIDICA'"
            >
              Pessoa Jurídica
            </Button>
          </div>

          <Alert v-if="error2" variant="destructive" class="mb-4" role="alert">
            <AlertDescription>{{ error2 }}</AlertDescription>
          </Alert>

          <!-- PESSOA FÍSICA -->
          <form v-if="tipoPessoa === 'FISICA'" @submit="onStep2Fisica" novalidate class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2 sm:col-span-2">
                <Label for="fNome">Nome completo</Label>
                <Input id="fNome" v-model="fNome" v-bind="fNomeAttrs" :aria-invalid="!!formFisica.errors.value.nome" />
                <p v-if="formFisica.errors.value.nome" class="text-sm text-destructive">{{ formFisica.errors.value.nome }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fCpf">CPF</Label>
                <Input id="fCpf" v-model="fCpf" v-bind="fCpfAttrs" placeholder="000.000.000-00" />
                <p v-if="formFisica.errors.value.cpf" class="text-sm text-destructive">{{ formFisica.errors.value.cpf }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fRg">RG</Label>
                <Input id="fRg" v-model="fRg" v-bind="fRgAttrs" />
                <p v-if="formFisica.errors.value.rg" class="text-sm text-destructive">{{ formFisica.errors.value.rg }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="fInscricao">Inscrição Municipal</Label>
                <Input id="fInscricao" v-model="fInscricao" v-bind="fInscricaoAttrs" />
                <p v-if="formFisica.errors.value.inscricaoMunicipal" class="text-sm text-destructive">{{ formFisica.errors.value.inscricaoMunicipal }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fDdd">DDD</Label>
                <Input id="fDdd" v-model="fDdd" v-bind="fDddAttrs" placeholder="11" maxlength="2" />
                <p v-if="formFisica.errors.value.ddd" class="text-sm text-destructive">{{ formFisica.errors.value.ddd }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fTelefone">Telefone</Label>
                <Input id="fTelefone" v-model="fTelefone" v-bind="fTelefoneAttrs" placeholder="99999-9999" />
                <p v-if="formFisica.errors.value.telefone" class="text-sm text-destructive">{{ formFisica.errors.value.telefone }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="fEmail">E-mail de contato</Label>
                <Input id="fEmail" type="email" v-model="fEmail" v-bind="fEmailAttrs" />
                <p v-if="formFisica.errors.value.emailContato" class="text-sm text-destructive">{{ formFisica.errors.value.emailContato }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fCep">CEP</Label>
                <Input id="fCep" v-model="fCep" v-bind="fCepAttrs" placeholder="00000-000" />
                <p v-if="formFisica.errors.value.cep" class="text-sm text-destructive">{{ formFisica.errors.value.cep }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fNumero">Número</Label>
                <Input id="fNumero" v-model="fNumero" v-bind="fNumeroAttrs" />
                <p v-if="formFisica.errors.value.numero" class="text-sm text-destructive">{{ formFisica.errors.value.numero }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="fLogradouro">Logradouro</Label>
                <Input id="fLogradouro" v-model="fLogradouro" v-bind="fLogradouroAttrs" placeholder="Rua, Av., etc." />
                <p v-if="formFisica.errors.value.logradouro" class="text-sm text-destructive">{{ formFisica.errors.value.logradouro }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="fComplemento">Complemento <span class="text-muted-foreground">(opcional)</span></Label>
                <Input id="fComplemento" v-model="fComplemento" v-bind="fComplementoAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="fBairro">Bairro</Label>
                <Input id="fBairro" v-model="fBairro" v-bind="fBairroAttrs" />
                <p v-if="formFisica.errors.value.bairro" class="text-sm text-destructive">{{ formFisica.errors.value.bairro }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fCidade">Cidade</Label>
                <Input id="fCidade" v-model="fCidade" v-bind="fCidadeAttrs" />
                <p v-if="formFisica.errors.value.cidade" class="text-sm text-destructive">{{ formFisica.errors.value.cidade }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fEstado">Estado (UF)</Label>
                <Input id="fEstado" v-model="fEstado" v-bind="fEstadoAttrs" placeholder="SP" maxlength="2" />
                <p v-if="formFisica.errors.value.estado" class="text-sm text-destructive">{{ formFisica.errors.value.estado }}</p>
              </div>
            </div>

            <Button type="submit" class="w-full" :disabled="loading2" :aria-busy="loading2">
              <span v-if="loading2" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ loading2 ? 'Criando empresa...' : 'Criar empresa' }}
            </Button>
          </form>

          <!-- PESSOA JURÍDICA -->
          <form v-else @submit="onStep2Juridica" novalidate class="space-y-4">
            <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dados da empresa</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2 sm:col-span-2">
                <Label for="jRazao">Razão Social</Label>
                <Input id="jRazao" v-model="jRazao" v-bind="jRazaoAttrs" />
                <p v-if="formJuridica.errors.value.razaoSocial" class="text-sm text-destructive">{{ formJuridica.errors.value.razaoSocial }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jFantasia">Nome Fantasia</Label>
                <Input id="jFantasia" v-model="jFantasia" v-bind="jFantasiaAttrs" />
                <p v-if="formJuridica.errors.value.nomeFantasia" class="text-sm text-destructive">{{ formJuridica.errors.value.nomeFantasia }}</p>
              </div>
              <div class="space-y-2">
                <Label for="jCnpj">CNPJ</Label>
                <Input id="jCnpj" v-model="jCnpj" v-bind="jCnpjAttrs" placeholder="00.000.000/0000-00" />
                <p v-if="formJuridica.errors.value.cnpj" class="text-sm text-destructive">{{ formJuridica.errors.value.cnpj }}</p>
              </div>
              <div class="space-y-2">
                <Label for="jRegime">Regime Tributário</Label>
                <Select v-model="jRegime" v-bind="jRegimeAttrs">
                  <SelectTrigger id="jRegime">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in regimesOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="formJuridica.errors.value.regimeTributario" class="text-sm text-destructive">{{ formJuridica.errors.value.regimeTributario }}</p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jInscricao">Inscrição Municipal</Label>
                <Input id="jInscricao" v-model="jInscricao" v-bind="jInscricaoAttrs" />
                <p v-if="formJuridica.errors.value.inscricaoMunicipal" class="text-sm text-destructive">{{ formJuridica.errors.value.inscricaoMunicipal }}</p>
              </div>
              <div class="space-y-2">
                <Label for="jDdd">DDD empresa</Label>
                <Input id="jDdd" v-model="jDdd" v-bind="jDddAttrs" placeholder="11" maxlength="2" />
              </div>
              <div class="space-y-2">
                <Label for="jTelefone">Telefone empresa</Label>
                <Input id="jTelefone" v-model="jTelefone" v-bind="jTelefoneAttrs" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jEmail">E-mail empresa</Label>
                <Input id="jEmail" type="email" v-model="jEmail" v-bind="jEmailAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jCep">CEP empresa</Label>
                <Input id="jCep" v-model="jCep" v-bind="jCepAttrs" placeholder="00000-000" />
              </div>
              <div class="space-y-2">
                <Label for="jNumero">Número</Label>
                <Input id="jNumero" v-model="jNumero" v-bind="jNumeroAttrs" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jLogradouro">Logradouro</Label>
                <Input id="jLogradouro" v-model="jLogradouro" v-bind="jLogradouroAttrs" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jComplemento">Complemento <span class="text-muted-foreground">(opcional)</span></Label>
                <Input id="jComplemento" v-model="jComplemento" v-bind="jComplementoAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jBairro">Bairro</Label>
                <Input id="jBairro" v-model="jBairro" v-bind="jBairroAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jCidade">Cidade</Label>
                <Input id="jCidade" v-model="jCidade" v-bind="jCidadeAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jEstado">Estado (UF)</Label>
                <Input id="jEstado" v-model="jEstado" v-bind="jEstadoAttrs" placeholder="SP" maxlength="2" />
              </div>
            </div>

            <p class="pt-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Representante Legal</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2 sm:col-span-2">
                <Label for="jRepNome">Nome do representante</Label>
                <Input id="jRepNome" v-model="jRepNome" v-bind="jRepNomeAttrs" />
                <p v-if="formJuridica.errors.value.repNome" class="text-sm text-destructive">{{ formJuridica.errors.value.repNome }}</p>
              </div>
              <div class="space-y-2">
                <Label for="jRepCpf">CPF</Label>
                <Input id="jRepCpf" v-model="jRepCpf" v-bind="jRepCpfAttrs" placeholder="000.000.000-00" />
              </div>
              <div class="space-y-2">
                <Label for="jRepRg">RG</Label>
                <Input id="jRepRg" v-model="jRepRg" v-bind="jRepRgAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jRepDdd">DDD</Label>
                <Input id="jRepDdd" v-model="jRepDdd" v-bind="jRepDddAttrs" placeholder="11" maxlength="2" />
              </div>
              <div class="space-y-2">
                <Label for="jRepTelefone">Telefone</Label>
                <Input id="jRepTelefone" v-model="jRepTelefone" v-bind="jRepTelefoneAttrs" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jRepEmail">E-mail do representante</Label>
                <Input id="jRepEmail" type="email" v-model="jRepEmail" v-bind="jRepEmailAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jRepCep">CEP</Label>
                <Input id="jRepCep" v-model="jRepCep" v-bind="jRepCepAttrs" placeholder="00000-000" />
              </div>
              <div class="space-y-2">
                <Label for="jRepNumero">Número</Label>
                <Input id="jRepNumero" v-model="jRepNumero" v-bind="jRepNumeroAttrs" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jRepLogradouro">Logradouro</Label>
                <Input id="jRepLogradouro" v-model="jRepLogradouro" v-bind="jRepLogradouroAttrs" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label for="jRepComplemento">Complemento <span class="text-muted-foreground">(opcional)</span></Label>
                <Input id="jRepComplemento" v-model="jRepComplemento" v-bind="jRepComplementoAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jRepBairro">Bairro</Label>
                <Input id="jRepBairro" v-model="jRepBairro" v-bind="jRepBairroAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jRepCidade">Cidade</Label>
                <Input id="jRepCidade" v-model="jRepCidade" v-bind="jRepCidadeAttrs" />
              </div>
              <div class="space-y-2">
                <Label for="jRepEstado">Estado (UF)</Label>
                <Input id="jRepEstado" v-model="jRepEstado" v-bind="jRepEstadoAttrs" placeholder="SP" maxlength="2" />
              </div>
            </div>

            <Button type="submit" class="w-full" :disabled="loading2" :aria-busy="loading2">
              <span v-if="loading2" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ loading2 ? 'Criando empresa...' : 'Criar empresa' }}
            </Button>
          </form>
        </div>

        <p v-if="step === 1" class="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?
          <a href="/login" class="font-medium text-primary underline-offset-4 hover:underline">Entrar</a>
        </p>
      </CardContent>
    </Card>
  </AuthLayout>
</template>
