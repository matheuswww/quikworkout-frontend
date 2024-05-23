import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { clothingPath } from "./clothingPath"

interface params {
  roupa_id: string
  cor: string
  tamanho: string
  quantidade: number 
}

type addClothingToCartResponse = "roupa ou inventário não encontrado" | "quantidade excede o stock" | "quantidade adicionada ao carrinho excede o stock" | 401 | 500 | 201

export default async function AddClothingToCart(cookie: string, params: params):Promise<addClothingToCartResponse> {
  const url = api+clothingPath+"/"+"addClothingToCart"
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
      if(status != 201) {    
        return res.json()
      }
    })
    if(status == 201 || status == 401 || status == 500) {
      return status
    }
    if(res?.message == "roupa ou inventário não encontrado" || res?.message == "quantidade excede o stock" || res?.message == "quantidade adicionada ao carrinho excede o stock") {
      return res.message
    }
    return 500
  } catch(err) {
    console.error("error trying AddClothingToCart:", err);
    return 500
  }
}