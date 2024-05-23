import { api } from "../path"
import { clothingPath } from "./clothingPath"

type statusCode = 200 | 404 | 401 | 500

export interface getClothingCartResponse {
  status: statusCode
  clothing: data[] | null
}

interface data {
  roupa_id: string;
  cor: string;
  quantidade: number;
  tamanho: string;
  preco: number;
  sexo: string;
  categoria: string;
  material: string;
  descricao: string;
  nome: string;
  quantidadeDisponivel: number;
  disponivel: boolean;
  excedeEstoque: boolean;
  imagem: string;
  criado_em: string
}


export default async function GetClothingCart(cookie: string, cursor?: string):Promise<getClothingCartResponse> {
  let url = api
  url += clothingPath+"/getClothingCart"
  if(cursor) {
    url+="?cursor="+cursor
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      credentials: "include",
      cache: "no-store"
    }).then(res => res)
    let status:statusCode
    if (res.status === 200 || res.status === 404 || res.status === 500 || res.status == 401) {
      status = res.status
    } else {
      status = 500
    } 
    let data:data[] | null
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
    console.error("error trying getClothingCart:", err);
    return {
      status: 500,
      clothing: null
    }
  }
}