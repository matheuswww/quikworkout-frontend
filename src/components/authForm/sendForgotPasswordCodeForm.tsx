'use client'
import { useEffect, useState } from 'react'
import styles from './sendForgotPasswordCodeForm.module.css'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SpinLoading from '../spinLoading/spinLoading'
import PopupError from '../popupError/popupError'
import SendForgotPasswordCode, { sendForgotPasswordCodeResponse } from '@/api/auth/forgotPassword'
import CheckForgotPasswordCodeForm from './checkForgotPasswordCodeForm'
import { ValidateEmail, ValidatePhoneNumber } from '@/funcs/validateEmailAndPhoneNumber'

const schema = z.object({
  emailOrPhoneNumber: z.string(),
}).refine((fields) => {
  if(fields.emailOrPhoneNumber.includes("@")) {
    return ValidateEmail(fields.emailOrPhoneNumber)
  }
  return ValidatePhoneNumber(fields.emailOrPhoneNumber)
}, {
  path: [ 'emailOrPhoneNumber' ],
  message: "email ou telefone inválido"
})

type FormProps = z.infer<typeof schema>

export default function SendForgotPasswordCodeForm() {
  const [isEmail, setIsEmail] = useState<boolean>(false)
  const [error, setError] = useState<sendForgotPasswordCodeResponse | null>(null)
  const [load, setLoad] = useState<boolean>(true)
  const [popUpError, setPopUpError] = useState<boolean>(false)
  const [next, setNext] = useState<boolean>(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })
  
  useEffect(() => {
    if(next) {
      const currentURL = window.location.href
      const URLObj = new URL(currentURL)
      URLObj.searchParams.set("sended", "true")
      const newURL = URLObj.toString()
      window.history.pushState(null, "", newURL)
    }
    const searchParams = new URLSearchParams(window.location.search)
    const searched = searchParams.get('sended')
    if(searched == "true") {
      if(!next) {
        setNext(true)
        return
      }
    }
    setLoad(false)
  },[next])

  async function handleForm(data: FormProps) {
    let isNum: boolean = true
    if(isNaN(Number(data.emailOrPhoneNumber))) {
      isNum = false
      setIsEmail(true)
    }
    setLoad(true)
    const res = await SendForgotPasswordCode({
      email: !isNum ? data.emailOrPhoneNumber : "",
      telefone: isNum ? data.emailOrPhoneNumber : ""
    })
    if(res == "seu código foi gerado porem não foi possivel criar uma sessão") {
      setPopUpError(true)
    }
    if(res == 500) {
      setPopUpError(true)
    } else if (res == "usuário não encontrado") {
      setError(res)
    } else if (res == 200) {
      localStorage.setItem("timeSendForgotPasswordCode", new Date().getTime().toString())
      setNext(true)
      return
    }
    setLoad(false)
  }

  return (
    <>
    { !next ? 
      <>
        {load && <SpinLoading />}
        {popUpError && <PopupError handleOut={(() => setPopUpError(false))}/>}
        <main className={`${styles.main} ${load && styles.load}`}>
          <section className={styles.section}>
            <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
              <h1>Insira seu contato para enviarmos um código de redefinição de senha</h1>
              <label htmlFor="emailOrPhoneNumber">E-mail ou telefone</label>
              <input {...register("emailOrPhoneNumber")} type="text" id="emailOrPhoneNumber" placeholder="email ou telefone(+55 somente)" max={255}/>
              {errors.emailOrPhoneNumber?.message ? <p className={styles.error}>{errors.emailOrPhoneNumber.message}</p> : error && <p className={styles.error}>{error}</p>}
              <button disabled={load ? true : false} className={`${load && styles.loading} ${styles.button}`} type="submit">{load ? "Carregando..." : "Enviar código"}</button>
            </form>
          </section>
        </main>
      </>
      : <CheckForgotPasswordCodeForm email={isEmail}  /> }
    </>
  )
}