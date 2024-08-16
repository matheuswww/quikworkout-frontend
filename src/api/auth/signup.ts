import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "../user/userPath"

interface params {
  nome: string
  email: string
  telefone: string
  senha: string
  token: string
}

type status = 201 | 409 | 500 

export type ResponseSignup = status | "recaptcha inválido"

export default async function Signup(params: params):Promise<ResponseSignup> {
  let url = api
  url+="/"+authPath+"/signup"
  try {
    let status: number = 0
    const res: ResponseErr | null  = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(params)
    }).then(res => {
      status = res.status
      if(res.status == 400) {
        return res.json()
      }
    })
    if (status == 201 || status == 409 || status == 500) {
      return status
    } else if (res?.message == "recaptcha inválido") {
      return res.message
    } else {
      return 500
    }
  } catch(err) {
    console.error("error trying signup:", err);
    return 500
  }
}