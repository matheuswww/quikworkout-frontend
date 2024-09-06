export interface card {
	nome: string
	numeroCartao: string
  expMes: number
	expAno: string
	cvv: string
  parcelas: number
	id3DS: string | null
}

export interface boleto {
  dataVencimento: string
  linhasInstrucao: instructionLine
  titularBoleto: holderBoleto 
}

interface holderBoleto {
  nome: string
  tax_id: string
  email: string
  endereco: enderecoBoleto
}

interface instructionLine {
  linha_1: string
  linha_2: string
}

export interface enderecoBoleto {
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  codigoRegiao: string
  regiao: string
  cep: string
}

export interface enderecoContato {
  nome: string
  email: string
  telefone: phoneNumber
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  codigoRegiao: string
  regiao: string
  cep: string
  tax_id: string
  servico: string
}

export interface phoneNumber {
  DDI: string
  DDD: string
  Numero: string
}

export interface clothing {
  roupaId: string
  cor: string
  tamanho: string
  quantidade: number
  preco: number
}

export type responseErrorsPayOrderType =
  | "não foi possivel salvar o pedido"
  | "cookie inválido"
  | "contato não verificado"
  | "erro ao deletar carrinho"
  | "a quantidade do pedido excede o estoque"
  | "roupa não encontrada"
  | "peso maxímo atingido"
  | "cep de destino inválido"
  | "frete não disponível"
  | "preço calculado não é igual ao esperado"

export const responseErrorsPayOrder: responseErrorsPayOrderType[] = [
  "cookie inválido",
  "contato não verificado",
  "não foi possivel salvar o pedido",
  "erro ao deletar carrinho",
  "roupa não encontrada",
  "peso maxímo atingido",
  "a quantidade do pedido excede o estoque",
  "cep de destino inválido",
  "frete não disponível",
  "preço calculado não é igual ao esperado",
]

export type responseErrorsRetryPaymentType =
  | 'cookie inválido'
  | 'não é possivel pagar novamente um pagamento cancelado'
  | 'novo tipo de pagamento não pode ser pix'
  | 'ocorreu uma alteração nos preços das roupas'
  | 'contato não verificado'
  | 'não é possível pagar um pedido cancelado com pix'
  | 'a quantidade do pedido excede o estoque'
  | 'roupa não encontrada'
  | 'peso máximo atingido'
  | 'cep de destino inválido'
  | 'pedido já está pago'
  | 'pedido está sendo processado'
  | 'preço calculado não é igual ao esperado'
  | 'não foi possível salvar o pedido'
  | 'frete não disponível'
  | 'erro ao deletar carrinho'
  
export const responseErrorsRetryPayment: responseErrorsRetryPaymentType[] = [
  'cookie inválido',
  'não é possivel pagar novamente um pagamento cancelado',
  'novo tipo de pagamento não pode ser pix',
  'ocorreu uma alteração nos preços das roupas',
  'contato não verificado',
  'não é possível pagar um pedido cancelado com pix',
  'a quantidade do pedido excede o estoque',
  'roupa não encontrada',
  'peso máximo atingido',
  'cep de destino inválido',
  'pedido está sendo processado',
  'frete não disponível',
  'pedido já está pago',
  'preço calculado não é igual ao esperado',
  'não foi possível salvar o pedido',
  'erro ao deletar carrinho',
]