import { api } from "../path"
import { clothingPath } from "./clothingPath"

type statusCode = 200 | 404 | 400 | 500

export interface getClothingByIdResponse {
  status: statusCode
  clothing: data | null
}

interface inventario {
  cor: string,
  corPrincipal: boolean,
  imgDesc: string,
  p: number,
  m: number,
  g: number,
  gg: number,
  images: string[] | null,
}

interface data {
  id: string,
  nome: string,
  sexo: string,
  categoria: string,
  material: string,
  preco: number,
  descricao: string,
  inventario: inventario[]
}

export default async function GetClothing(id: string):Promise<getClothingByIdResponse> {
  let url = api
  url += clothingPath+"/getClothingById?roupa_id="+id
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store"
    }).then(res => res)
    let status:statusCode
    if (res.status === 200 || res.status === 404 || res.status === 400 || res.status === 500) {
      status = res.status
    } else {
      status = 500
    }
    
    let data:data | null
    if (status == 200) {
      data = await res.json()
    } else {
      data = null
    }

    return {
      status: status,
      clothing: data
    }
  } catch(err) {
    console.error("error trying getClothing:", err);
    return {
      status: 500,
      clothing: null
    }
  }
}