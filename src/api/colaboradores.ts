import api from '@/lib/axios'
import type { ColaboradorReq, ColaboradorResp, AtualizarColaboradorReq } from '@/types/colaborador'

export function listarColaboradores() {
  return api.get<ColaboradorResp[]>('/v1/admin/colaboradores')
}

export function criarColaborador(data: ColaboradorReq) {
  return api.post<ColaboradorResp>('/v1/admin/colaboradores', data)
}

export function atualizarColaborador(id: string, data: AtualizarColaboradorReq) {
  return api.put<ColaboradorResp>(`/v1/admin/colaboradores/${id}`, data)
}
