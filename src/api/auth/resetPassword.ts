import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "./userPath"

export type resetPassword = 
  "máximo de tentativas atingido" |
  "código expirado" |
  "você não possui um código registrado" |
  500 | 200 | 401

interface params {
  senha: string
}

export default async function ResetPassword(cookie: string,params: params):Promise<resetPassword> {
  let url = api
  url+="/"+authPath+"/resetPassword"
  try {
    let status: number = 0
    const res: ResponseErr = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
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
    let msg: resetPassword | null = null
    if(res.message == "máximo de tentativas atingido" || res.message == "código expirado" || res.message == "você não possui um código registrado") {
      msg = res.message
    }
    if(msg != null) {
      return msg
    }
    return 500
  } catch(err) {
    console.error("error trying ResetPassword:", err);
    return 500
  }
}