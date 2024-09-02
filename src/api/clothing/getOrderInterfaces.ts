
interface card {
  bandeira: string
  ultimos_digitos: string
  portador: holder_card
  mensagem: string
  parcelas: number
}

interface holder_card {
  name: string
}

interface boleto {
  dataVencimento: string
  linhasInstrucao: instructionsLines
  codigoBarra: string
  pdf: string
  codigoBarraFormatado: string
  titular: holder_boleto
  mensagem: string
}

interface holder_boleto {
  nome: string
  tax_id: string
  email: string
  endereco: address
}

interface address {
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  regiao: string
  codigoRegiao: string
  cep: string
}

interface instructionsLines {
  linha_1: string
  linha_2: string | null
}

interface pix {
  status: string
  mensagem: string
  nome: string
  tax_id: string
  qrcode: string
  link: string
  dataExpiracao: string
}

interface getOrder {
  pedido_id: string
  status_pagamento: string
  tipo_pagamento: string
  email: string
  telefone: string
  servico: string
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  criadoEm: string
  precoTotal: number
  frete: number
  motivoCancelamentoEnvio: string
  pacotes: packages[]
}

interface packages {
  codigoRastreio: string
  roupa: clothing[]
}

interface clothing {
  id: string
  nome: string
  descricao: string
  preco: number
  cor: string
  tamanho: string
  quantidade: number
  imagem: string
  alt: string
}