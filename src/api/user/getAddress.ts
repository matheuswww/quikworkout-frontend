import { api } from "../path"
import { userPath } from "./userPath"

export interface getAdressResponse {
  data: data | null
  status: statusgetAdress
}

type statusgetAdress = 200 | 404 | 500 | 401

interface data {
  nome: string
  email: string
  twoAuthEmail: string
  twoAuthTelefone: string
  telefone: string
  verificado: boolean
}

export default async function GetAdress(cookie: string):Promise<getAdressResponse> {
  let url = api
  url+="/"+userPath+"/getAdress"
  try {
    let status:number = 0
    const res: data | null = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie
      },
      credentials: "include",
      cache: "no-cache",
    }).then(res => {
      status = res.status
      return res.json()
    })
    if (status === 404 || status === 500 || status === 401 || status === 200) {
      return {
        data: res,
        status
      }
    }
    return {
      data: null,
      status: 500
    }
  } catch(err) {
    console.error("error trying getAdress:", err);
    return {
      data: null,
      status: 500
    }
  }
}