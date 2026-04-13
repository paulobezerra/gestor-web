import api from '@/lib/axios'
import type { LoginReq, LoginResp, RecuperarSenhaReq, RedefinirSenhaReq, RenovarTokenReq } from '@/types/auth'

export function login(data: LoginReq) {
  return api.post<LoginResp>('/v1/auth/login', data)
}

export function renovarToken(data: RenovarTokenReq) {
  return api.post<LoginResp>('/v1/auth/renovar-token', data)
}

export function recuperarSenha(data: RecuperarSenhaReq) {
  return api.post<void>('/v1/auth/recuperar-senha', data)
}

export function redefinirSenha(data: RedefinirSenhaReq) {
  return api.post<void>('/v1/auth/redefinir-senha', data)
}
