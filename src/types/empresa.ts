import type { StatusAsaas } from './inquilino'

export interface ConfiguracaoFiscalReq {
  codigoServico: string
  aliquotaIss: number
  retencaoIrrf: number
  retencaoPis: number
  retencaoCofins: number
  retencaoCsll: number
  retencaoInss: number
}

export interface AsaasKeyReq {
  apiKey: string
}

export interface AsaasStatusResp {
  status: StatusAsaas
}
