import api from '@/lib/axios'
import type { UsuarioReq, UsuarioResp } from '@/types/usuario'

export function criarUsuario(data: UsuarioReq) {
  return api.post<UsuarioResp>('/v1/usuario', data)
}
