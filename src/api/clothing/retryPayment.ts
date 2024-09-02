import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { clothingPath } from "./clothingPath"
import { boleto, card, clothing, responseErrorsRetryPayment, responseErrorsRetryPaymentType } from "./payOrderInterfaces"

export type payOrderResponse = responseErrorsRetryPaymentType | response | "recaptcha inválido" | 500

interface response {
  pedido_id: string
}

interface params {
  pedido_id: string
  precoTotal: number
  roupa: clothing[]
  tipoPagamento: string
  novoTipoPagamento: string
  cartao: card | null
  boleto: boleto | null
  token: string
}

export default async function RetryPayment(cookie: string, params: params):Promise<payOrderResponse> {
  let url = api
  url+=clothingPath+"/retryPayment"
  try {
    let status: number = 0
    const res: ResponseErr | response | null = await fetch(url, {
      method: "PATCH",
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
    if(res && 'message' in res && res.message == "recaptcha inválido") {
      return res.message
    }
    if (res && 'message' in res && res.message) {
      if (responseErrorsRetryPayment.includes(res.message as responseErrorsRetryPaymentType)) {
        return res.message as responseErrorsRetryPaymentType
      }
      const quantityErrorPattern = /a quantidade do pedido \d+ excede o estoque/
      if (quantityErrorPattern.test(res.message)) {
        return "a quantidade do pedido excede o estoque" as responseErrorsRetryPaymentType
      }
    }
    return 500
  } catch(err) {
    console.error("error trying RetryPayment:", err);
    return 500
  }
}