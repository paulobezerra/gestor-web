export interface ServicoReq {
  nome: string
  descricao?: string
  precoBase: number
  duracaoMinutos: number
  codigoServico?: string
  cnae?: string
  aliquotaIss?: number
}

export interface ServicoResp {
  id: string
  nome: string
  descricao?: string
  precoBase: number
  duracaoMinutos: number
  codigoServico?: string
  cnae?: string
  aliquotaIss?: number
  ativo: boolean
}

export interface AlterarStatusReq {
  ativo: boolean
}

export interface PaginaServicos {
  content: ServicoResp[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
