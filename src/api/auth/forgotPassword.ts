import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "../user/userPath"

export type sendForgotPasswordCodeResponse = 
  "usuário não encontrado" |
  "seu código foi gerado porem não foi possivel criar uma sessão" |
  500 | 200

interface params {
  email: string
  telefone: string
}

export default async function SendForgotPasswordCode(params: params):Promise<sendForgotPasswordCodeResponse> {
  let url = api
  url+="/"+authPath+"/sendForgotPasswordCode"
  try {
    let status: number = 0
    const res: ResponseErr | null = await fetch(url, {
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
    if(status == 200 || status == 500) {
      return status
    }
    let msg: sendForgotPasswordCodeResponse | null = null
    if(res?.message == "usuário não encontrado" || res?.message == "seu código foi gerado porem não foi possivel criar uma sessão") {
      msg = res?.message
    }
    if(msg != null) {
      return msg
    }
    return 500
  } catch(err) {
    console.error("error trying sendForgotPasswordCode:", err);
    return 500
  }
}