import { Dispatch, SetStateAction } from "react";

export default function RecaptchaForm(setError: Dispatch<SetStateAction<string | null>>): string {
  if("grecaptcha" in window) {
    //@ts-ignore
    const token = window.grecaptcha.getResponse() 
    if (token != "") {
      return token
    }
  }
  setError(`preencha a caixa de "não sou um robô"`)
  return ""
}