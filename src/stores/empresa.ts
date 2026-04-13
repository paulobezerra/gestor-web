import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { InquilinoResp } from '@/types/inquilino'
import { getEmpresa } from '@/api/empresa'

export const useEmpresaStore = defineStore('empresa', () => {
  const empresa = ref<InquilinoResp | null>(null)
  const loading = ref(false)

  async function fetchEmpresa() {
    loading.value = true
    try {
      const { data } = await getEmpresa()
      empresa.value = data
    } catch {
      empresa.value = null
    } finally {
      loading.value = false
    }
  }

  return { empresa, loading, fetchEmpresa }
})
