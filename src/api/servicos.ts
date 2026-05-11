import api from '@/lib/axios'
import type { AlterarStatusReq, PaginaServicos, ServicoReq, ServicoResp } from '@/types/servico'

export function listarServicos(params?: { nome?: string; ativo?: boolean }) {
  return api.get<PaginaServicos>('/v1/servicos', { params: { ...params, size: 100 } })
}

export function criarServico(data: ServicoReq) {
  return api.post<ServicoResp>('/v1/servicos', data)
}

export function buscarServico(id: string) {
  return api.get<ServicoResp>(`/v1/servicos/${id}`)
}

export function atualizarServico(id: string, data: ServicoReq) {
  return api.put<ServicoResp>(`/v1/servicos/${id}`, data)
}

export function alterarStatusServico(id: string, data: AlterarStatusReq) {
  return api.patch<ServicoResp>(`/v1/servicos/${id}/status`, data)
}
