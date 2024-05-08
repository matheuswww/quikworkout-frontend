import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "./userPath"

interface params {
  email: string
  telefone: string
  senha: string
}

interface singninResponeSuccess {
  twoAuth: boolean
}

export type signinResponse = 
  "contato não cadastrado" |
  "senha errada" |
  singninResponeSuccess | 500

export default async function Signin(params: params):Promise<signinResponse> {
  let url = api
  url+="/"+authPath+"/signin"
  let status: number = 0
  try {
    const res: ResponseErr | singninResponeSuccess = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(params)
    }).then(res => {
      status = res.status
      return res.json()
    })
    if('twoAuth' in res) {
      return res
    }
    if (status == 500) {
      return status
    }
    if('message' in res && (res.message == "contato não cadastrado" || res.message == "senha errada")) {
      return res.message
    }
    return 500
  } catch(err) {
    console.error("error trying signin:", err);
    return 500
  }
}