import { api } from "@/api/path"
import { pathManager } from "../pathManager"
import { managerProfile } from "./pathProfile"

export interface params {
  pedido_id: string
  codigo_rastreio: string
}

type updateTrackingCode = 401 | 404 | 500 | 200

export default async function UpdateTrackingCode(cookie: string, params: params):Promise<updateTrackingCode> {
  const url = api+pathManager+managerProfile+"/"+"updateTrackingCode"
  try {
    const res: number = await fetch(url, {
      method: "POST",
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
    console.error("error trying updateTrackingCode:", err);
    return 500
  }
}