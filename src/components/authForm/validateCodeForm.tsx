'use client'

import Link from 'next/link'
import styles from './validateCodeForm.module.css'
import { SyntheticEvent, useEffect, useState } from 'react'
import { setInterval } from 'timers'
import CheckContactValidationCode, { checkContactValidationCodeResponse } from '@/api/auth/validateCode'
import PopupError from '../popupError/popupError'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SpinLoading from '../spinLoading/spinLoading'
import { useRouter } from 'next/navigation'

interface props {
  email: boolean
  cookie: string
}

const schema = z.object({
  code: z.string().min(6, "o código deve conter 6 caracteres").max(6, "o código deve conter 6 caracteres")
})

type FormProps = z.infer<typeof schema>

export default function ValidateCodeForm({...props}:props) {
  const router = useRouter()
  const [timer,setTimer] = useState<number>(0)
  const [load, setLoad] = useState<boolean>(false)
  const [error, setError] = useState<checkContactValidationCodeResponse | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  async function handleForm(data: FormProps) {
    setLoad(true)    
    const res = await CheckContactValidationCode(props.cookie, {
      codigo: data.code
    })
    setLoad(false)
    if(res != 200 && res != "usuário já verificado") {
      if(typeof res == "string") {
        setError(res)
      } else if (res == 500) {
        setStatus(res)
      }
    } else {
      router.push("/")
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
    const prevTime = Number(localStorage.getItem("time"))
    const currentTIme = new Date().getTime()
    let elapsedTime: number = 0
    if(prevTime) {
      elapsedTime = Math.round(Math.abs(currentTIme - prevTime) / 1000)
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
      {status == 500 && <PopupError handleOut={(() => setStatus(null))} />}
      {load && <SpinLoading />}
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
          <h1>Verifique seu {props.email ? "email" : "SMS"}</h1>
          <input {...register("code")} type="number" placeholder="insira seu código" />
          {errors.code?.message ? <p className={styles.error}>{errors.code.message}</p> : error && <p className={styles.error}>{error}</p>}
          <Link onClick={handleClick} href="/autenticacao/validar-contato">{timer <= 60 ? `Não chegou? Aguarde 1 minuto para pedir outro código ${timer}` : "Enviar outro código"}</Link>
          <button type="submit" className={`${load && styles.loading}`}>{load ? "Enviando código, aguarde" : "Enviar código"}</button>
        </form>
      </main>
    </>
  )
}