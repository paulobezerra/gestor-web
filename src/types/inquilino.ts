export type TipoPessoa = 'FISICA' | 'JURIDICA'
export type StatusAsaas = 'NAO_CONFIGURADO' | 'CONFIGURADO' | 'ERRO'
export type RegimeTributario =
  | 'MEI'
  | 'SIMPLES'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'NAO_TRIBUTADO'

export interface InquilinoContatoDTO {
  ddd: string
  telefone: string
  email: string
}

export interface InquilinoEnderecoDTO {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface InquilinoEmpresaRepresentanteDTO {
  nome: string
  cpf: string
  rg: string
  contato: InquilinoContatoDTO
  endereco: InquilinoEnderecoDTO
}

export interface InquilinoPrestadorReq {
  emailUsuario: string
  nome: string
  cpf: string
  rg: string
  inscricaoMunicipal: string
  contato: InquilinoContatoDTO
  endereco: InquilinoEnderecoDTO
}

export interface InquilinoEmpresaReq {
  emailUsuario: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  regimeTributario: RegimeTributario
  inscricaoMunicipal: string
  representante: InquilinoEmpresaRepresentanteDTO
  contato: InquilinoContatoDTO
  endereco: InquilinoEnderecoDTO
}

export interface InquilinoResp {
  id: string
  tipoPessoa: TipoPessoa
  proprietarioId: string
  nome: string
  razaoSocial?: string
  cnpj?: string
  statusAsaas: StatusAsaas
}
