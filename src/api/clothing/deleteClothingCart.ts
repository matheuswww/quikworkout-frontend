import { api } from "../path"
import { clothingPath } from "./clothingPath"

interface params {
  roupa_id: string
  cor: string
  tamanho: string
}

type deleteClothingCartResponse = 401 | 404 | 500 | 200

export default async function DeleteClothingCart(cookie: string, params: params):Promise<deleteClothingCartResponse> {
  const url = api+clothingPath+"/"+"deleteClothingCart"
  try {
    const res: number = await fetch(url, {
      method: "DELETE",
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
    console.error("error trying deleteClothingCart:", err);
    return 500
  }
}