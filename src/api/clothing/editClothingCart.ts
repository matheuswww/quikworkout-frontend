import { api } from "../path"
import { clothingPath } from "./clothingPath"

interface params {
  roupa_id: string
  cor: string
  tamanho: string
  novaCor: string
  novoTamanho: string
  novaQuantidade: number
}

type editClothingCartResponse = 401 | 404 | 500 | 200 | "quantidade excede o stoque" | "stock é zero" | "quantidade é menor que 0"

export default async function EditClothingCart(cookie: string, params: params):Promise<editClothingCartResponse> {
  const url = api+clothingPath+"/"+"updateClothingCart"
  try {
    const res: number = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      body: JSON.stringify(params),
    }).then(res => {
      return res.status
    })
    if(res == 200 || res == 401 || res == 500 || res == 404) {
      return res
    }
    return 500
  } catch(err) {
    console.error("error trying editClothingCart:", err);
    return 500
  }
}