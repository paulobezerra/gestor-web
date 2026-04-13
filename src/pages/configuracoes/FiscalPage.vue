<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { atualizarFiscal } from '@/api/empresa'
import type { ProblemDetail } from '@/types/api'

const aliquotaSchema = z.coerce.number().min(0, 'Mínimo 0').max(100, 'Máximo 100')

const schema = toTypedSchema(
  z.object({
    codigoServico: z.string().min(1, 'Obrigatório'),
    aliquotaIss: aliquotaSchema,
    retencaoIrrf: aliquotaSchema,
    retencaoPis: aliquotaSchema,
    retencaoCofins: aliquotaSchema,
    retencaoCsll: aliquotaSchema,
    retencaoInss: aliquotaSchema,
  }),
)

const { handleSubmit, errors, defineField } = useForm({ validationSchema: schema })
const [codigoServico, codigoServicoAttrs] = defineField('codigoServico')
const [aliquotaIss, aliquotaIssAttrs] = defineField('aliquotaIss')
const [retencaoIrrf, retencaoIrrfAttrs] = defineField('retencaoIrrf')
const [retencaoPis, retencaoPisAttrs] = defineField('retencaoPis')
const [retencaoCofins, retencaoCofinsAttrs] = defineField('retencaoCofins')
const [retencaoCsll, retencaoCsllAttrs] = defineField('retencaoCsll')
const [retencaoInss, retencaoInssAttrs] = defineField('retencaoInss')

const loading = ref(false)
const apiError = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  apiError.value = null
  try {
    await atualizarFiscal(values)
    toast.success('Configurações fiscais salvas com sucesso.')
  } catch (err) {
    const ax = err as AxiosError<ProblemDetail>
    apiError.value = ax.response?.data?.detail ?? 'Erro ao salvar. Tente novamente.'
  } finally {
    loading.value = false
  }
})

const percentFields = [
  { label: 'Alíquota ISS (%)', model: aliquotaIss, attrs: aliquotaIssAttrs, id: 'aliquotaIss', error: () => errors.value.aliquotaIss },
  { label: 'Retenção IRRF (%)', model: retencaoIrrf, attrs: retencaoIrrfAttrs, id: 'retencaoIrrf', error: () => errors.value.retencaoIrrf },
  { label: 'Retenção PIS (%)', model: retencaoPis, attrs: retencaoPisAttrs, id: 'retencaoPis', error: () => errors.value.retencaoPis },
  { label: 'Retenção COFINS (%)', model: retencaoCofins, attrs: retencaoCofinsAttrs, id: 'retencaoCofins', error: () => errors.value.retencaoCofins },
  { label: 'Retenção CSLL (%)', model: retencaoCsll, attrs: retencaoCsllAttrs, id: 'retencaoCsll', error: () => errors.value.retencaoCsll },
  { label: 'Retenção INSS (%)', model: retencaoInss, attrs: retencaoInssAttrs, id: 'retencaoInss', error: () => errors.value.retencaoInss },
]
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-2xl p-6">
      <h1 class="mb-6 text-2xl font-bold">Dados Fiscais</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuração fiscal</CardTitle>
          <CardDescription>
            Alíquotas e retenções utilizadas na emissão de NFS-e
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert v-if="apiError" variant="destructive" class="mb-4" role="alert">
            <AlertDescription>{{ apiError }}</AlertDescription>
          </Alert>

          <form @submit="onSubmit" novalidate class="space-y-4">
            <div class="space-y-2">
              <Label for="codigoServico">Código de serviço municipal</Label>
              <Input
                id="codigoServico"
                v-model="codigoServico"
                v-bind="codigoServicoAttrs"
                :aria-invalid="!!errors.codigoServico"
                :aria-describedby="errors.codigoServico ? 'codigo-error' : undefined"
              />
              <p v-if="errors.codigoServico" id="codigo-error" class="text-sm text-destructive" role="alert">
                {{ errors.codigoServico }}
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div v-for="field in percentFields" :key="field.id" class="space-y-2">
                <Label :for="field.id">{{ field.label }}</Label>
                <Input
                  :id="field.id"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  v-model="field.model.value"
                  v-bind="field.attrs"
                  :aria-invalid="!!field.error()"
                />
                <p v-if="field.error()" class="text-sm text-destructive" role="alert">
                  {{ field.error() }}
                </p>
              </div>
            </div>

            <Button type="submit" :disabled="loading" :aria-busy="loading">
              <span v-if="loading" class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
