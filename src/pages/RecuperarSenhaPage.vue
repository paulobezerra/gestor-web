<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { recuperarSenha } from '@/api/auth'
import type { ProblemDetail } from '@/types/api'

const schema = toTypedSchema(
  z.object({
    email: z.string().email('E-mail inválido'),
  }),
)

const { handleSubmit, errors, defineField } = useForm({ validationSchema: schema })
const [email, emailAttrs] = defineField('email')

const loading = ref(false)
const success = ref(false)
const apiError = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  apiError.value = null
  try {
    await recuperarSenha({ email: values.email })
    success.value = true
  } catch (err) {
    const axiosError = err as AxiosError<ProblemDetail>
    apiError.value = axiosError.response?.data?.detail ?? 'Ocorreu um erro. Tente novamente.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>Informe seu e-mail para receber as instruções</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="success" class="mb-4">
          <AlertDescription>
            Se este e-mail existir no sistema, você receberá as instruções em breve.
          </AlertDescription>
        </Alert>

        <Alert v-if="apiError" variant="destructive" class="mb-4" role="alert">
          <AlertDescription>{{ apiError }}</AlertDescription>
        </Alert>

        <form v-if="!success" @submit="onSubmit" novalidate class="space-y-4">
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

          <Button type="submit" class="w-full" :disabled="loading" :aria-busy="loading">
            <span v-if="loading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ loading ? 'Enviando...' : 'Enviar instruções' }}
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
