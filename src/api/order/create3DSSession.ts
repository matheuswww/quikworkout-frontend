import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { orderPath } from "./orderPath"
import { paymentPath } from "./paymentPath"

type statusCode = 500

type responseErrors = "cookie inválido" | "contato não verificado"

export interface create3DSSessionData {
  session: string
  expires_at: number
}

type create3DSSessionResponse = statusCode | responseErrors | create3DSSessionData

export default async function Create3DSSession(cookie: string): Promise<create3DSSessionResponse> {
  let url = api
  url+=orderPath+paymentPath+"/create3DSSession"
  let status: number = 0
  try {
    const res: ResponseErr | create3DSSessionData | null = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie
      },
      credentials: "include"      
    }).then(res => {
      status = res.status
      return res.json()
    })
    if (status == 500) {
      return status
    }
    if(res && "message" in res && (res.message == "cookie inválido" || res.message == "contato não verificado")) {
      return res.message
    }
    if(status == 201 && res && "session" in res) {
      return res
    }
    return 500
  } catch(err) {
    console.error("error trying Create3DSSession:", err);
    return 500
  }
}