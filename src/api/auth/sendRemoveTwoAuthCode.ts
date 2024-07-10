import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { twoAuthPath } from "../user/userPath"

export type sendRemoveTwoAuthCodeResponse = 
  "usuário não é verificado" |
  "seu código foi gerado porem não foi possivel criar uma sessão" |
  "senha errada" |
  "usuário não possui autenticação de dois fatores" |
  "contato não cadastrado" |
  500 | 200 | 401

interface params {
  senha: string
}

export default async function SendRemoveTwoAuthCode(cookie: string, params: params):Promise<sendRemoveTwoAuthCodeResponse> {
  let url = api
  url+="/"+twoAuthPath+"/sendRemoveTwoAuthCode"
  try {
    let status: number = 0
    const res: ResponseErr | null = await fetch(url, {
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
    if(status == 200 || status == 401 || status == 500) {
      return status
    }
    let msg: sendRemoveTwoAuthCodeResponse | null = null
    if(res?.message == "usuário não é verificado" || res?.message == "seu código foi gerado porem não foi possivel criar uma sessão" || res?.message == "senha errada" || res?.message == "usuário não possui autenticação de dois fatores" || res?.message == "contato não cadastrado") {
      msg = res?.message
    }
    if(msg != null) {
      return msg
    }
    return 500
  } catch(err) {
    console.error("error trying sendRemoveTwoAuthCode:", err);
    return 500
  }
}