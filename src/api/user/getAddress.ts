import { api } from "../path"
import { userPath } from "./userPath"

export interface getAdressResponse {
  data: address[] | null
  status: statusgetAdress
}

type statusgetAdress = 200 | 404 | 500 | 401

export interface getAddressData {
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  codigoRegiao: string
  cep: string
}

export default async function GetAddress(cookie: string):Promise<getAdressResponse> {
  let url = api
  url+="/"+userPath+"/getAddress"
  try {
    let status:number = 0
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie
      },
      credentials: "include",
      cache: "no-cache",
    }).then(res => {
      status = res.status
      if(status == 200) {
        return res.json()
      }
    })
    
    if(status === 404 || status === 500 || status === 401) {
      return {
        data: null,
        status: status
      }
    }
    if(status == 200) {
      return {
        data: res,
        status: 200
      }
    }
    return {
      data: null,
      status: 500
    }
  } catch(err) {
    console.error("error trying getAddress:", err);
    return {
      data: null,
      status: 500
    }
  }
}