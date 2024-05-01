import { api } from "../path"
import { ResponseErr } from "../responseErr"
import { authPath } from "./userPath"

export type statusSendContactValidationCode = 200 | 401 | 500 | 404 | 400

export default async function SendContactValidationCode(cookie: string):Promise<statusSendContactValidationCode | "usuário já verificado"> {
  let url = api
  url+="/"+authPath+"/sendContactValidationCode"
  try {
    let status: number = 0
    const res: ResponseErr | null = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include"
    }).then(res => {
      status = res.status
      if(status != 200) {
        return res.json()
      }
    })
    if (res?.message == "usuário já verificado") {  
      return res.message
    } else if (status == 200 || status == 401 || status == 404 || status == 500 || status == 400) {
      return status
    }
    return 500
  } catch(err) {
    console.error("error trying sendContactValidationCode:", err);
    return 500
  }
}