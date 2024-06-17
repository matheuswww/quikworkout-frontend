import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { clothingPath } from "./clothingPath"
import { boleto, card, clothing, phoneNumber, responseErrorsPayOrder, responseErrorsPayOrderType } from "./payOrderInterfaces"

export type payOrderResponse = responseErrorsPayOrderType | response | "cookie inválido" | "contato não verificado" | 500

interface response {
  pedido_id: string
}

interface params {
  precoTotal: number

  roupa: clothing[]  

  nome: string
  email: string
  telefone: phoneNumber
  tax_id: string

  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  codigoRegiao: string
  regiao: string
  cep: string
  servico: string

  tipoPagamento: string

  cartao: card | null
  boleto: boleto | null
}

export default async function PayOrder(cookie: string, params: params):Promise<payOrderResponse> {
  let url = api
  url+=clothingPath+"/payOrder"
  console.log(params);
  
  try {
    let status: number = 0
    const res: ResponseErr | response | null = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      body: JSON.stringify(params),
    }).then(res => {
      status = res.status    
      return res.json()
    })
    if(status == 201) {
      if(res && 'pedido_id' in res) {
        return res
      }
    }
    if (res && 'message' in res && res.message) {
      if (responseErrorsPayOrder.includes(res.message as responseErrorsPayOrderType)) {
        return res.message as responseErrorsPayOrderType
      }
      const quantityErrorPattern = /a quantidade do pedido \d+ excede o estoque/
      if (quantityErrorPattern.test(res.message)) {
        return "a quantidade do pedido excede o estoque" as responseErrorsPayOrderType
      }
      if(res.message == "cookie inválido") {
        return res.message
      }
      if(res.message == "contato não verificado") {
        return res.message
      }
    }
    return 500
  } catch(err) {
    console.error("error trying PayOrder:", err);
    return 500
  }
}