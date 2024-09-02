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
  | "não foi possível pagar o pedido"
  | "erro ao pagar pedido. não autorizado pelo pagseguro"
  | "erro ao pagar pedido. quantidade de tentativas excedidas - não tente novamente"
  | "erro ao pagar pedido. não autorizado pelo emissor do cartão"
  | "erro ao pagar pedido. transação inválida - não tente novamente"
  | "erro ao pagar pedido. transação não permitida - não tente novamente"
  | "erro ao pagar pedido. contate a central do seu cartão"
  | "erro ao pagar pedido. compra não autorizada"
  | "erro ao pagar pedido. verifique os dados do cartão"
  | "erro ao pagar pedido. parcelamento inválido - não tente novamente"
  | "erro ao pagar pedido. valor da transação não permitido - não tente novamente"
  | "erro ao pagar pedido. senha inválida - não tente novamente"
  | "erro ao pagar pedido. transação não permitida - não tente novamente"
  | "erro ao pagar pedido. contate a central do seu cartão - não tente novamente"
  | "erro ao pagar pedido. falha de comunicação tente mais tarde"
  | "erro ao pagar pedido. transação não permitida para o cartão - não tente novamente"
  | "erro ao pagar pedido. senha inválida"
  | "erro ao pagar pedido. senha inválida utilize a nova senha"
  | "erro ao pagar pedido. excedidas tentativas de senha. Contate a central do seu cartão"
  | "erro ao pagar pedido. valor execedido. Contate a central do seu cartão"
  | "erro ao pagar pedido. quantidade de saques execedida. Contate a central do seu cartão"
  | "erro ao pagar pedido. conta de origem inválida - não tente novamente"
  | "erro ao pagar pedido. utilize função crédito"
  | "erro ao pagar pedido. utilize função débito"
  | "erro ao pagar pedido. saque não disponível - não tente novamente"
  | "erro ao pagar pedido. dados do cartão inválido - não tente novamente"
  | "erro ao pagar pedido. erro no cartão - não tente novamente"
  | "erro ao pagar pedido. refazer a transação"
  | "erro ao pagar pedido. cartão não permite transação internacional"
  | "erro ao pagar pedido. desbloquei o cartão"
  | "erro ao pagar pedido. server error"

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
  "não foi possível pagar o pedido",
  "erro ao pagar pedido. não autorizado pelo pagseguro",
  "erro ao pagar pedido. quantidade de tentativas excedidas - não tente novamente",
  "erro ao pagar pedido. não autorizado pelo emissor do cartão",
  "erro ao pagar pedido. transação inválida - não tente novamente",
  "erro ao pagar pedido. transação não permitida - não tente novamente",
  "erro ao pagar pedido. contate a central do seu cartão",
  "erro ao pagar pedido. compra não autorizada",
  "erro ao pagar pedido. verifique os dados do cartão",
  "erro ao pagar pedido. parcelamento inválido - não tente novamente",
  "erro ao pagar pedido. valor da transação não permitido - não tente novamente",
  "erro ao pagar pedido. senha inválida - não tente novamente",
  "erro ao pagar pedido. transação não permitida - não tente novamente",
  "erro ao pagar pedido. contate a central do seu cartão - não tente novamente",
  "erro ao pagar pedido. falha de comunicação tente mais tarde",
  "erro ao pagar pedido. transação não permitida para o cartão - não tente novamente",
  "erro ao pagar pedido. senha inválida",
  "erro ao pagar pedido. senha inválida utilize a nova senha",
  "erro ao pagar pedido. excedidas tentativas de senha. Contate a central do seu cartão",
  "erro ao pagar pedido. valor execedido. Contate a central do seu cartão",
  "erro ao pagar pedido. quantidade de saques execedida. Contate a central do seu cartão",
  "erro ao pagar pedido. conta de origem inválida - não tente novamente",
  "erro ao pagar pedido. utilize função crédito",
  "erro ao pagar pedido. utilize função débito",
  "erro ao pagar pedido. saque não disponível - não tente novamente",
  "erro ao pagar pedido. dados do cartão inválido - não tente novamente",
  "erro ao pagar pedido. erro no cartão - não tente novamente",
  "erro ao pagar pedido. refazer a transação",
  "erro ao pagar pedido. cartão não permite transação internacional",
  "erro ao pagar pedido. desbloquei o cartão",
  "erro ao pagar pedido. server error"
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
  | 'frete não disponível'
  | 'não foi possível pagar o pedido'
  | 'pedido já está pago'
  | 'pedido está sendo processado'
  | 'preço calculado não é igual ao esperado'
  | 'não foi possível salvar o pedido'
  | 'erro ao deletar carrinho'
  | "erro ao pagar pedido. não autorizado pelo pagseguro"
  | "erro ao pagar pedido. quantidade de tentativas excedidas - não tente novamente"
  | "erro ao pagar pedido. não autorizado pelo emissor do cartão"
  | "erro ao pagar pedido. transação inválida - não tente novamente"
  | "erro ao pagar pedido. transação não permitida - não tente novamente"
  | "erro ao pagar pedido. contate a central do seu cartão"
  | "erro ao pagar pedido. compra não autorizada"
  | "erro ao pagar pedido. verifique os dados do cartão"
  | "erro ao pagar pedido. parcelamento inválido - não tente novamente"
  | "erro ao pagar pedido. valor da transação não permitido - não tente novamente"
  | "erro ao pagar pedido. senha inválida - não tente novamente"
  | "erro ao pagar pedido. transação não permitida - não tente novamente"
  | "erro ao pagar pedido. contate a central do seu cartão - não tente novamente"
  | "erro ao pagar pedido. falha de comunicação tente mais tarde"
  | "erro ao pagar pedido. transação não permitida para o cartão - não tente novamente"
  | "erro ao pagar pedido. senha inválida"
  | "erro ao pagar pedido. senha inválida utilize a nova senha"
  | "erro ao pagar pedido. excedidas tentativas de senha. Contate a central do seu cartão"
  | "erro ao pagar pedido. valor execedido. Contate a central do seu cartão"
  | "erro ao pagar pedido. quantidade de saques execedida. Contate a central do seu cartão"
  | "erro ao pagar pedido. conta de origem inválida - não tente novamente"
  | "erro ao pagar pedido. utilize função crédito"
  | "erro ao pagar pedido. utilize função débito"
  | "erro ao pagar pedido. saque não disponível - não tente novamente"
  | "erro ao pagar pedido. dados do cartão inválido - não tente novamente"
  | "erro ao pagar pedido. erro no cartão - não tente novamente"
  | "erro ao pagar pedido. refazer a transação"
  | "erro ao pagar pedido. cartão não permite transação internacional"
  | "erro ao pagar pedido. desbloquei o cartão"
  | "erro ao pagar pedido. server error"
  
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
  'não foi possível pagar o pedido',
  'pedido já está pago',
  'preço calculado não é igual ao esperado',
  'não foi possível salvar o pedido',
  'erro ao deletar carrinho',
  'erro ao pagar pedido. não autorizado pelo pagseguro',
  'erro ao pagar pedido. quantidade de tentativas excedidas - não tente novamente',
  'erro ao pagar pedido. não autorizado pelo emissor do cartão',
  'erro ao pagar pedido. transação inválida - não tente novamente',
  'erro ao pagar pedido. transação não permitida - não tente novamente',
  'erro ao pagar pedido. contate a central do seu cartão',
  'erro ao pagar pedido. compra não autorizada',
  'erro ao pagar pedido. verifique os dados do cartão',
  'erro ao pagar pedido. parcelamento inválido - não tente novamente',
  'erro ao pagar pedido. valor da transação não permitido - não tente novamente',
  'erro ao pagar pedido. senha inválida - não tente novamente',
  'erro ao pagar pedido. transação não permitida - não tente novamente',
  'erro ao pagar pedido. contate a central do seu cartão - não tente novamente',
  'erro ao pagar pedido. falha de comunicação tente mais tarde',
  'erro ao pagar pedido. transação não permitida para o cartão - não tente novamente',
  'erro ao pagar pedido. senha inválida',
  'erro ao pagar pedido. senha inválida utilize a nova senha',
  'erro ao pagar pedido. excedidas tentativas de senha. Contate a central do seu cartão',
  'erro ao pagar pedido. valor execedido. Contate a central do seu cartão',
  'erro ao pagar pedido. quantidade de saques execedida. Contate a central do seu cartão',
  'erro ao pagar pedido. conta de origem inválida - não tente novamente',
  'erro ao pagar pedido. utilize função crédito',
  'erro ao pagar pedido. utilize função débito',
  'erro ao pagar pedido. saque não disponível - não tente novamente',
  'erro ao pagar pedido. dados do cartão inválido - não tente novamente',
  'erro ao pagar pedido. erro no cartão - não tente novamente',
  'erro ao pagar pedido. refazer a transação',
  'erro ao pagar pedido. cartão não permite transação internacional',
  'erro ao pagar pedido. desbloquei o cartão',
  'erro ao pagar pedido. server error'
]