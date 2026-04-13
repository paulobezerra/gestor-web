import api from '@/lib/axios'
import type { InquilinoPrestadorReq, InquilinoEmpresaReq, InquilinoResp } from '@/types/inquilino'

export function criarPessoaFisica(data: InquilinoPrestadorReq) {
  return api.post<InquilinoResp>('/v1/inquilino/pessoa-fisica', data)
}

export function criarPessoaJuridica(data: InquilinoEmpresaReq) {
  return api.post<InquilinoResp>('/v1/inquilino/pessoa-juridica', data)
}

export function getMeuInquilino() {
  return api.get<InquilinoResp>('/v1/inquilino/meu')
}
