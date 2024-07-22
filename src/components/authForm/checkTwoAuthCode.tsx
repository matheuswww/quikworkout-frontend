'use client'

import { z } from 'zod'
import styles from './validateCodeForm.module.css'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import PopupError from '../popupError/popupError'
import SpinLoading from '../spinLoading/spinLoading'
import CheckTwoAuthCode, { checkTwoAuthCodeResponse } from '@/api/auth/checkTwoAuthCode'
import { useRouter } from 'next/navigation'
import { deleteCookie } from '@/action/deleteCookie'

interface props {
  cookieName: string | undefined
  cookieVal: string | undefined
}

const schema = z.object({
  code: z.string().min(6, "o código deve conter 6 caracteres").max(6, "o código deve conter 6 caracteres")
})

type FormProps = z.infer<typeof schema>

export default function CheckTwoAuthCodeForm({...props}: props) {
  const cookie = props.cookieName+"="+props.cookieVal
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  const [load, setLoad] = useState<boolean>(false)
  const [error, setError] = useState<checkTwoAuthCodeResponse | null>(null)
  const [popUpError, setPopUpError] = useState<boolean>(false)

  async function handleForm(data: FormProps) { 
    setPopUpError(false)
    setError(null)
    setLoad(true)    
    const res = await CheckTwoAuthCode(cookie, {
      codigo: data.code
    })
    if(res == "usuário não possui autenticação de dois fatores") {
      await deleteCookie("userTwoAuth")
      window.location.href = "/auth/entrar"
      return
    }
    if(res == "você não possui um código registrado" || res == "máximo de tentativas atingido"  || res == "código expirado") {
      window.location.href = "/auth/validar-codigo-dois-fatores"
      return
    }
    if(res == "código valido porém não foi possivel criar uma sessão") {
      await deleteCookie("userTwoAuth")
      localStorage.removeItem("timeSendCreateTwoAuthCode")
      window.location.href = "/auth/entrar"
      return
    }
    if (res == 401){
      await deleteCookie("userTwoAuth")
      window.location.href = "/auth/entrar"
      return
    } else if (res != 200) {
      if(typeof res == "string") {
        setError(res)
      } else if (res == 500) {
        setPopUpError(false)
      }
      setLoad(false)
    } else {
      window.location.href = "/"
    }
  }

  return (
    <>
      {popUpError && <PopupError handleOut={(() => setPopUpError(false))} />}
      {load && <SpinLoading />}
      <main className={`${styles.main} ${load && styles.lowOpacity}`}>
        <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
          <h1>Autenticação de dois fatores</h1>
          <label htmlFor="code">Enviamos um código de dois fatores para você</label>
          <input {...register("code")} id="code" type="number" placeholder="insira seu código" />
          {errors.code?.message ? <p className={styles.error}>{errors.code.message}</p> : error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={`${load && styles.loading}`}>{load ? "Carregando..." : "Enviar código"}</button>
        </form>
      </main>
    </>
  )
}
