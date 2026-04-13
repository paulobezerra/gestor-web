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
import { useAuthStore } from '@/stores/auth'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()
const authStore = useAuthStore()

const schema = toTypedSchema(
  z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha obrigatória'),
  }),
)

const { handleSubmit, errors, defineField } = useForm({ validationSchema: schema })
const [email, emailAttrs] = defineField('email')
const [senha, senhaAttrs] = defineField('senha')

const loading = ref(false)
const apiError = ref<string | null>(null)
const showPassword = ref(false)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  apiError.value = null
  try {
    await authStore.login(values.email, values.senha)
    router.push('/dashboard')
  } catch (err) {
    const axiosError = err as AxiosError<ProblemDetail>
    apiError.value =
      axiosError.response?.data?.detail ?? 'Credenciais inválidas. Tente novamente.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta do Gestor</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="apiError" variant="destructive" class="mb-4" role="alert">
          <AlertDescription>{{ apiError }}</AlertDescription>
        </Alert>

        <form @submit="onSubmit" novalidate class="space-y-4">
          <div class="space-y-2">
            <Label for="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              v-bind="emailAttrs"
              placeholder="voce@exemplo.com"
              autocomplete="email"
              :aria-describedby="errors.email ? 'email-error' : undefined"
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" id="email-error" class="text-sm text-destructive" role="alert">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="senha">Senha</Label>
            <div class="relative">
              <Input
                id="senha"
                :type="showPassword ? 'text' : 'password'"
                v-model="senha"
                v-bind="senhaAttrs"
                placeholder="••••••••"
                autocomplete="current-password"
                class="pr-10"
                :aria-describedby="errors.senha ? 'senha-error' : undefined"
                :aria-invalid="!!errors.senha"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="errors.senha" id="senha-error" class="text-sm text-destructive" role="alert">
              {{ errors.senha }}
            </p>
          </div>

          <div class="flex items-center justify-end">
            <a href="/recuperar-senha" class="text-sm text-primary underline-offset-4 hover:underline">
              Esqueci minha senha
            </a>
          </div>

          <Button type="submit" class="w-full" :disabled="loading" :aria-busy="loading">
            <span v-if="loading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </Button>
        </form>

        <p class="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?
          <a href="/registro" class="font-medium text-primary underline-offset-4 hover:underline">
            Criar conta
          </a>
        </p>
      </CardContent>
    </Card>
  </AuthLayout>
</template>
