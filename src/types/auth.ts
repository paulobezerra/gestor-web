export interface LoginReq {
  email: string
  senha: string
}

export interface LoginResp {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RecuperarSenhaReq {
  email: string
}

export interface RedefinirSenhaReq {
  token: string
  novaSenha: string
}

export interface RenovarTokenReq {
  refreshToken: string
}
