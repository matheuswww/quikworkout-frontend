import { api } from "../path"
import { authPath } from "./authPath"

interface params {
  nome: string
  email: string
  telefone: string
  senha: string
}

export type Status = 201 | 409 | 500

export default async function Signup(params: params):Promise<Status> {
  let url = api
  url+="/"+authPath+"/signup"
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(params)
    }).then(res => res)
    if (res.status == 201 || res.status == 409 || res.status == 500) {
      return res.status
    } else {
      return 500
    }
  } catch(err) {
    console.error("error trying POST:", err);
    return 500
  }
}