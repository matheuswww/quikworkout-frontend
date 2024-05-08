import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "./userPath"

export type checkForgotPasswordCodeResponse = 
  "máximo de tentativas atingido" |
  "código inválido" |
  "código expirado" |
  "cookie inválido" |
  "usuário já possui autenticação de dois fatores" |
  "código valido porém não foi possivel criar uma sessão" |
  "você não possui um código registrado" |
  500 | 200 | 401

interface params {
  codigo: string
}

export default async function CheckForgotPasswordCode(params: params):Promise<checkForgotPasswordCodeResponse> {
  let url = api
  url+="/"+authPath+"/checkForgotPasswordCode"
  try {
    let status: number = 0
    const res: ResponseErr = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    }).then(res => {
      status = res.status
      if(status != 200) {    
        return res.json()
      }
    })
    
    if(status == 200 || status == 500 || status == 401) {
      return status
    }
    let msg: checkForgotPasswordCodeResponse | null = null
    if(res.message == "máximo de tentativas atingido" || res.message == "código inválido" || res.message == "código expirado" || res.message == "código valido porém não foi possivel criar uma sessão" || res.message == "código inválido" || res.message == "usuário já possui autenticação de dois fatores" || res.message == "você não possui um código registrado") {
      msg = res.message
    }
    if(msg != null) {
      return msg
    }
    return 500
  } catch(err) {
    console.error("error trying CheckForgotPassword:", err);
    return 500
  }
}