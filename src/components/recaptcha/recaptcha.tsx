"use client"
import styles from "./recaptcha.module.css"
import { useEffect, useRef, useState } from "react"

interface props {
  className: string
  classNameP?: string
}

const url = "https://www.google.com/recaptcha/api.js?hl=pt-BR"

export default function Recaptcha({className, classNameP}:props) {
  const [load, setLoad] = useState<boolean>(false)
  const recaptchaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const script = document.querySelector("#recaptcha_script")
    if(script instanceof HTMLElement) {
      document.body.removeChild(script)
    }
    const newScript = document.createElement("script")
    newScript.src = url
    newScript.id = "recaptcha_script"
    newScript.onload = () => setTimeout(() => setLoad(true),1000)
    document.body.appendChild(newScript)
  },[])

  return (
   <>
    <div className={`${"g-recaptcha"} ${className} ${!load && styles.displayNone} ${load && styles.active}`} data-theme="dark" data-sitekey="6Lfn2yYqAAAAAD10njUMLet_P23u8sKFOXM1SzqB" ref={recaptchaRef}></div> 
    {!load && <p className={`${styles.p} ${classNameP}`}>Carregando "Não sou um robô"...</p>}
   </>
  )
}