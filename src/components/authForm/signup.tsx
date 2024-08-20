'use client'

import Link from 'next/link'
import styles from './login.module.css'
import Password from './password'
import Background from 'next/image'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Signup, { ResponseSignup } from '@/api/auth/signup'
import { useState } from 'react'
import SpinLoading from '../spinLoading/spinLoading'
import PopupError from '../popupError/popupError'
import { ValidateEmail, ValidatePhoneNumber } from '@/funcs/validateEmailAndPhoneNumber'
import Recaptcha from '../recaptcha/recaptcha'
import RecaptchaForm from '@/funcs/recaptchaForm'

const schema = z.object({
  emailOrPhoneNumber: z.string(),
  password: z.string().min(8,"senha precisa ter pelo menos 8 caracteres").max(72, "A senha deve ter no maxímo de 72 caracteres"),
  confirmPassword: z.string(),
  name: z.string().min(2, "nome precisa ter pelo menos de 2 caracteres").max(20, "O nome deve ter no maximo 20 caracteres"),
  privacy: z.boolean().refine((val) => val, {message: "é necessário aceitar a política de privacidade",})
}).refine((fields) => fields.password == fields.confirmPassword, {
  path: [ 'confirmPassword' ],
  message: "as senhas precisam ser iguais"
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

export default function SignupForm() {
  const [res, setStatus] = useState<ResponseSignup | null>(null)
  const [isEmail, setIsEmail] = useState<boolean>(true)
  const [load,setLoad] = useState<boolean>(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  const handleForm = async (data: FormProps) => {
    setRecaptchaError(null)
    setStatus(null)
    let isNum: boolean = false
    if(!isNaN(Number(data.emailOrPhoneNumber))) {
      isNum = true
      setIsEmail(false)
    }
    const token = RecaptchaForm(setRecaptchaError)
    if(token == "") {
      return
    }
    setLoad(true)
    const res = await Signup({
      email: isNum ? "" : data.emailOrPhoneNumber,
      telefone: isNum ? data.emailOrPhoneNumber : "",
      nome: data.name,
      senha: data.password,
      token: token
    })
    if (res == "recaptcha inválido") {
      setRecaptchaError(res)
      //@ts-ignore
      window.grecaptcha.reset()
    }
    if(res == 201) {
      window.location.href = "/auth/validar-contato"
      return
    }
    setStatus(res)
    setLoad(false)
  }

  return (
    <>
      { load && <SpinLoading /> }
      { res == 500 && <PopupError handleOut={(() => setStatus(null))} className={styles.popupError} /> }
      <main className={`${styles.main} ${load && styles.lowOpacity}`}>
        <div className={styles.containerBackground}>
          <Background src="/img/background-login.jpg" alt="mulher em um barra de crossfit executando um exercício" fill loading="lazy" quality={80} className={styles.background}/>
        </div>
        <section className={styles.section}>
          <form className={`${styles.form} ${styles.formSignup}`} onSubmit={handleSubmit(handleForm)}>
            <h1>Efetuar Cadastro</h1>
            <label htmlFor="name">Nome</label>
            <input {...register("name")} type="text" id="name" placeholder="nome"/>
            {errors.name?.message && <p className={styles.error}>{errors.name.message}</p>}
            <label htmlFor="emailOrPhoneNumber">E-mail ou telefone</label>
            <input {...register("emailOrPhoneNumber")} type="text" id="emailOrPhoneNumber" placeholder="email ou telefone(+55 somente)" max={255}/>
            {errors.emailOrPhoneNumber?.message ? <p className={styles.error}>{errors.emailOrPhoneNumber.message}</p> : res == 409 && <p className={styles.error}>Este {isEmail ? "email" : "telefone"} já esta sendo utilizado</p>}
            <label htmlFor="password">Senha</label>
            <Password {...register("password")} id="password" placeholder="senha"/> 
            {errors.password?.message && <p className={styles.error}>{errors.password.message}</p>}
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <Password {...register("confirmPassword")} id="confirmPassword" placeholder="confirmar senha"/>
            <div className={styles.privacy}>
              <label htmlFor="privacy">Aceitar <Link href="/politica-privacidade" target="_blank">política de privacidade</Link></label>
              <input {...register("privacy")} type="checkbox" id="privacy"/>
            </div>
            {errors.confirmPassword?.message ? <p className={styles.error}>{errors.confirmPassword.message}</p> : errors.privacy?.message && <p className={styles.error}>{errors.privacy.message}</p>}
            {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
            <Recaptcha className={styles.recaptcha} />
            <Link href="/auth/entrar">Já possui uma conta?</Link>
            <button disabled={load ? true : false} className={`${styles.login} ${load && styles.loading}`} type="submit">{load ? "Cadastrando, aguarde" : "Cadastrar"}</button>
          </form>
        </section>
      </main>
    </>
  )
}