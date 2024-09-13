import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "../user/userPath"

export type updateProfile = 
  "senha errada" |
  "contato já utilizado" |
  500 | 200 | 401

interface params {
  email: string | null
  nome: string | null
  senha: string
  token: string
}

export default async function UpdateProfile(cookie: string,params: params):Promise<updateProfile> {
  let url = api
  url+="/"+authPath+"/updateProfile"
  try {
    let status: number = 0
    const res: ResponseErr = await fetch(url, {
      method: "PATCH",
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
    if(res.message == "senha errada" || res.message == "contato já utilizado") {
      return res.message
    }
    return 500
  } catch(err) {
    console.error("error trying UpdateProfile:", err);
    return 500
  }
}