import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "./userPath"

export type checkContactValidationCodeResponse = 
  "usuário verificado porém não foi possível criar uma sessão" |
  "usuário já verificado" |
  "máximo de tentativas atingido" |
  "código inválido" |
  "código expirado" |
  "você não possui um código registrado" |
  500 | 200

interface params {
  codigo: string
}

export default async function CheckContactValidationCode(cookie: string, params: params):Promise<checkContactValidationCodeResponse> {
  let url = api
  url+="/"+authPath+"/checkContactValidationCode"
  try {
    let status: number = 0
    const res: ResponseErr = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      body: JSON.stringify(params),
    }).then(res => {
      status = res.status
      if(status != 200) {    
        return res.json()
      }
    })
    if(status == 200 || status == 500) {
      return status
    }
    let msg: checkContactValidationCodeResponse | null = null
    if(res.message == "usuário verificado porém não foi possível criar uma sessão" || res.message == "usuário já verificado" || res.message == "máximo de tentativas atingido" || res.message == "código inválido" || res.message == "código expirado" || res.message == "você não possui um código registrado") {
      msg = res.message
    }
    if(msg != null) {
      return msg
    }
    return 500
  } catch(err) {
    console.error("error trying validateCode:", err);
    return 500
  }
}