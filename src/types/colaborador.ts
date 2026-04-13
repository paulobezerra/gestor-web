export type Role = 'ADMINISTRADOR' | 'FINANCEIRO' | 'TECNICO' | 'RECEPCAO'

export interface ColaboradorReq {
  nome: string
  email: string
  senha: string
  role: Role
}

export interface ColaboradorResp {
  id: string
  nome: string
  email: string
  role: Role
  ativo: boolean
}

export interface AtualizarColaboradorReq {
  role?: Role
  ativo?: boolean
}
