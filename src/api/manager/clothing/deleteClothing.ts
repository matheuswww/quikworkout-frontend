import { api } from "@/api/path"
import { managerClothing } from "./pathClothing"
import { pathManager } from "../pathManager"

interface params {
  id: string
}

type deleteClothing = 401 | 404 | 500 | 200

export default async function DeleteClothing(cookie: string, params: params):Promise<deleteClothing> {
  const url = api+pathManager+managerClothing+"/"+"deleteClothing"
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
    console.error("error trying deleteClothing:", err);
    return 500
  }
}