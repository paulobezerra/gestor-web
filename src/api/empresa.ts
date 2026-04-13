import api from '@/lib/axios'
import type { InquilinoResp } from '@/types/inquilino'
import type { ConfiguracaoFiscalReq, AsaasKeyReq, AsaasStatusResp } from '@/types/empresa'

export function getEmpresa() {
  return api.get<InquilinoResp>('/v1/admin/empresa')
}

export function atualizarFiscal(data: ConfiguracaoFiscalReq) {
  return api.put<void>('/v1/admin/empresa/fiscal', data)
}

export function salvarAsaasKey(data: AsaasKeyReq) {
  return api.post<AsaasStatusResp>('/v1/admin/empresa/asaas', data)
}

export function getAsaasStatus() {
  return api.get<AsaasStatusResp>('/v1/admin/empresa/asaas')
}
