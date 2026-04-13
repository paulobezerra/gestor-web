<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Eye, EyeOff } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { redefinirSenha } from '@/api/auth'
import type { ProblemDetail } from '@/types/api'

const route = useRoute()
const router = useRouter()
const token = route.query['token'] as string

const schema = toTypedSchema(
  z
    .object({
      novaSenha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
      confirmacao: z.string(),
    })
    .refine((data) => data.novaSenha === data.confirmacao, {
      message: 'As senhas não coincidem',
      path: ['confirmacao'],
    }),
)

const { handleSubmit, errors, defineField } = useForm({ validationSchema: schema })
const [novaSenha, novaSenhaAttrs] = defineField('novaSenha')
const [confirmacao, confirmacaoAttrs] = defineField('confirmacao')

const loading = ref(false)
const apiError = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmacao = ref(false)

const onSubmit = handleSubmit(async (values) => {
  if (!token) {
    apiError.value = 'Token inválido ou ausente.'
    return
  }
  loading.value = true
  apiError.value = null
  try {
    await redefinirSenha({ token, novaSenha: values.novaSenha })
    toast.success('Senha redefinida com sucesso!')
    router.push('/login')
  } catch (err) {
    const axiosError = err as AxiosError<ProblemDetail>
    apiError.value = axiosError.response?.data?.detail ?? 'Ocorreu um erro. O token pode ter expirado.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>Crie uma nova senha para sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="!token" variant="destructive" class="mb-4" role="alert">
          <AlertDescription>Link inválido. Solicite um novo link de recuperação de senha.</AlertDescription>
        </Alert>

        <Alert v-if="apiError" variant="destructive" class="mb-4" role="alert">
          <AlertDescription>{{ apiError }}</AlertDescription>
        </Alert>

        <form @submit="onSubmit" novalidate class="space-y-4">
          <div class="space-y-2">
            <Label for="novaSenha">Nova senha</Label>
            <div class="relative">
              <Input
                id="novaSenha"
                :type="showPassword ? 'text' : 'password'"
                v-model="novaSenha"
                v-bind="novaSenhaAttrs"
                placeholder="••••••••"
                autocomplete="new-password"
                class="pr-10"
                :aria-describedby="errors.novaSenha ? 'nova-senha-error' : undefined"
                :aria-invalid="!!errors.novaSenha"
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
            <p v-if="errors.novaSenha" id="nova-senha-error" class="text-sm text-destructive" role="alert">
              {{ errors.novaSenha }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="confirmacao">Confirmar nova senha</Label>
            <div class="relative">
              <Input
                id="confirmacao"
                :type="showConfirmacao ? 'text' : 'password'"
                v-model="confirmacao"
                v-bind="confirmacaoAttrs"
                placeholder="••••••••"
                autocomplete="new-password"
                class="pr-10"
                :aria-describedby="errors.confirmacao ? 'confirmacao-error' : undefined"
                :aria-invalid="!!errors.confirmacao"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                @click="showConfirmacao = !showConfirmacao"
                :aria-label="showConfirmacao ? 'Ocultar confirmação' : 'Mostrar confirmação'"
              >
                <EyeOff v-if="showConfirmacao" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="errors.confirmacao" id="confirmacao-error" class="text-sm text-destructive" role="alert">
              {{ errors.confirmacao }}
            </p>
          </div>

          <Button type="submit" class="w-full" :disabled="loading || !token" :aria-busy="loading">
            <span v-if="loading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ loading ? 'Salvando...' : 'Redefinir senha' }}
          </Button>
        </form>

        <p class="mt-4 text-center text-sm">
          <a href="/login" class="font-medium text-primary underline-offset-4 hover:underline">
            Voltar ao login
          </a>
        </p>
      </CardContent>
    </Card>
  </AuthLayout>
</template>
