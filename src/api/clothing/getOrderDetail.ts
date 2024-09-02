import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { clothingPath } from "./clothingPath"

type statusCode = 404 | 200 | 500 | 401 | 400

type responseErrors = "cookie inválido" | "contato não verificado"

interface responseGetOrderDetail {
  informacoesPagamento: paymentInfos
  pedido: order
}

interface order {
  pedido_id: string
  status_pagamento: string
  tipo_pagamento: string
  codigo_rastreio: string
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
  pacote_id: string
  codigoRastreio: string
  numeroPacote: number
  largura:  number
  altura: number
  peso: number
  comprimento: number
  preco: number
  roupa: clothing[]
}

interface clothing {
  id: string
  preco: number
  nome: string
  descricao: string
  cor: string
  tamanho: string
  quantidade: number
  imagem: string
  alt: string
}

type paymentInfos = card | boleto | pix

export interface getOrderDetailResponse {
  status: statusCode
  data: responseGetOrderDetail | responseErrors | null
}

export default async function GetOrderDetail(cookie: string, pedido_id: string, tipo_pagamento: string):Promise<getOrderDetailResponse> {
  let url = api
  url += clothingPath+"/getOrderDetail?pedido_id="+pedido_id+"&tipoPagamento="+tipo_pagamento
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      credentials: "include",
      cache: "no-store"
    }).then(res => res)
    let status:statusCode
    if (res.status === 200 || res.status === 404 || res.status === 401 || res.status === 500 || res.status == 400) {
      status = res.status
    } else {
      status = 500
    }    
    let data: card | boleto | pix | ResponseErr | null = null
    if (status == 200 || status == 401 || status == 400) {
      data = await res.json()
    }
    
    if(data && typeof data == "object" && "message" in data && (data.message == "cookie inválido" || data.message == "contato não verificado")) {
      return {
        status: status,
        data: data.message
      }
    }
    if(data && typeof data == "object" && "informacoesPagamento" in data && "pedido" in data) {
      return {
        status: status,
        data: data as responseGetOrderDetail
      }
    }
    
    return {
      status: status,
      data: null
    }
  } catch(err) {
    console.error("error trying getOrderDetail:", err);
    return {
      status: 500,
      data: null
    }
  }
}