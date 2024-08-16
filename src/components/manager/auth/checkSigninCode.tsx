'use client'

import styles from "./checkSigninCode.module.css"
import { deleteCookie } from "@/action/deleteCookie"
import CheckSigninCode, { checkSigninCode } from "@/api/manager/auth/checkSigninCode"
import PopupError from "@/components/popupError/popupError"
import Recaptcha from "@/components/recaptcha/recaptcha"
import SpinLoading from "@/components/spinLoading/spinLoading"
import RecaptchaForm from "@/funcs/recaptchaForm"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { SyntheticEvent, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface props {
  cookie: string
}

const schema = z.object({
  code: z.string().min(8, "o código deve conter 8 caracteres").max(8, "o código deve conter 8 caracteres")
})

type FormProps = z.infer<typeof schema>

export default function CheckSigninCodeForm({...props}:props) {
  const [timer,setTimer] = useState<number>(0)
  const [load, setLoad] = useState<boolean>(false)
  const [error, setError] = useState<checkSigninCode | null>(null)
  const [popUpError, setPopUpError] = useState<boolean>(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  async function handleForm(data: FormProps) {
    setPopUpError(false)
    setRecaptchaError(null)
    setError(null)
    const token = RecaptchaForm(setRecaptchaError)
    if(token == "") {
      return
    }
    setLoad(true)    
    const res = await CheckSigninCode(props.cookie, {
      codigo: data.code,
      token: token
    })
    if (res == "recaptcha inválido") {
      setRecaptchaError(res)
      setLoad(false)
      //@ts-ignore
      window.grecaptcha.reset()
      return
    }
    if(res == "você não possui um código registrado" || res == "maximo de tentativas atingido" || res == "código expirado") {
      await deleteCookie("adminAuth")
      window.location.href = "/manager-quikworkout/auth"
      return
    }
    if(res == "código valido porém não foi possivel criar uma sessão") {
      await deleteCookie("adminAuth")
      localStorage.removeItem("timeSendSigninCode")
      window.location.href = "/manager-quikworkout/auth"
      return
    }
    if (res == 401){
      await deleteCookie("adminAuth")
      localStorage.removeItem("timeSendSigninCode")
      window.location.href = "/manager-quikworkout/auth"
      return
    } else if (res != 200) {
      if(typeof res == "string") {
        setError(res)
      } else if (res == 500) {
        setPopUpError(true)
      }
      setLoad(false)
    } else {
      localStorage.removeItem("timeSendSigninCode")
      window.location.href = "/"
      return
    }
  }

  function handleClick(event: SyntheticEvent) {
    event.preventDefault()
    if(timer >= 60) {
      var newUrl = window.location.pathname
      window.history.replaceState(null, "", newUrl);
      window.location.reload()
    }
  }

  useEffect(() => {
    setLoad(false)
    const prevTime = Number(localStorage.getItem("timeSendSigninCode"))
    const currentTIme = new Date().getTime()
    let elapsedTime: number = 0
    if(prevTime) {
      elapsedTime = Math.round(Math.abs(currentTIme - prevTime) / 1000)
      if(elapsedTime > 60 * 5) {
        localStorage.removeItem("timeSendSigninCode")
        window.location.href = "/manager-quikworkout/auth"
      }
    } else {
      elapsedTime = 60
    }
    setTimer(elapsedTime)
    const interval = setInterval(() => {
      setTimer((t) => t + 1)
      if(timer >= 60) {
        clearInterval(interval)
      }
    },1000)
  }, [])
  
  return (
    <>
      {popUpError && <PopupError handleOut={(() => setPopUpError(false))} />}
      {load && <SpinLoading />}
      <main className={`${styles.main} ${load && styles.lowOpacity}`}>
        <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
          <h1>Verifique seu email</h1>
          <input {...register("code")} type="number" placeholder="insira seu código" />
          {errors.code?.message ? <p className={styles.error}>{errors.code.message}</p> : error && <p className={styles.error}>{error}</p>}
          {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
          <Link onClick={handleClick} href="/manager-quikworkout/auth">{timer <= 60 ? `Não chegou? Aguarde 1 minuto para pedir outro código ${timer}` : "Enviar outro código"}</Link>
          <Recaptcha className={styles.recaptcha} />
          <button disabled={load ? true : false} type="submit" className={`${load && styles.loading}`}>{load ? "Carregando..." : "Enviar código"}</button>
        </form>
      </main>
    </>
  )
}