'use client'

import Link from 'next/link'
import styles from './signup.module.css'
import Password from './password'
import Background from 'next/image'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Signup, { Status } from '@/api/auth/signup'
import { useState } from 'react'
import SpinLoading from '../spinLoading/spinLoading'
import PopupError from '../popupError/popupError'

const schema = z.object({
  emailOrPhoneNumber: z.string(),
  password: z.string().min(8,"senha precisa ter pelo menos 8 caracteres").max(72, "A senha deve ter no maxímo de 72 caracteres"),
  confirmPassword: z.string(),
  name: z.string().min(2, "nome precisa ter pelo menos de 2 caracteres").max(20, "O nome deve ter no maximo 20 caracteres"),
}).refine((fields) => fields.password == fields.confirmPassword, {
  path: [ 'confirmPassword' ],
  message: "as senhas precisam ser iguais"
}).refine((fields) => {
  let possibleNumber = fields.emailOrPhoneNumber
  let regex = /[+\-]/g;
  if(possibleNumber.startsWith("+55")) {
    possibleNumber = possibleNumber.slice(3)
  }
  if(possibleNumber.match(regex) != null) {
    possibleNumber = possibleNumber.replace(regex, '')
  }
  const num = Number(possibleNumber)
  if(!isNaN(num)) {
    fields.emailOrPhoneNumber = num.toString()
    if(fields.emailOrPhoneNumber.length >= 8) {
      regex = /^[1-9]{2}[0-9]{9}$/;
      return regex.test(fields.emailOrPhoneNumber)
    }
    return false
  }
  regex = /^[\w\d.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(fields.emailOrPhoneNumber)
}, {
  path: [ 'emailOrPhoneNumber' ],
  message: "email ou telefone incorreto"
})

type FormProps = z.infer<typeof schema>

export default function SignupForm() {
  const [status, setStatus] = useState<Status | null>(null)
  const [isEmail, setIsEmail] = useState<boolean>(true)
  const [load,setLoad] = useState<boolean>(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  const handleForm = async (data: FormProps) => {
    let isNum: boolean = false
    if(!isNaN(Number(data.emailOrPhoneNumber))) {
      isNum = true
      setIsEmail(false)
    }
    setLoad(true)
    const status = await Signup({
      email: isNum ? "" : data.emailOrPhoneNumber,
      telefone: isNum ? data.emailOrPhoneNumber : "",
      nome: data.name,
      senha: data.password,
    })
    console.log(status);
    
    setStatus(status)
    setLoad(false)
  }

  return (
    <>
      { load && <SpinLoading /> }
      { status == 500 && <PopupError handleOut={(() => setStatus(null))} className={styles.popupError} /> }
      <main className={`${styles.main} ${load && styles.lowOpacity}`}>
        <div className={styles.containerBackground}>
          <Background src="/img/background-login.jpg" alt="mulher em um barra de crossfit executando um exercício" fill loading="lazy" quality={80} className={styles.background}/>
        </div>
        <section className={styles.section}>
          <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
            <h1>Efetuar Cadastro</h1>
            <label htmlFor="name">Nome</label>
            <input {...register("name")} type="text" id="name" placeholder="nome"/>
            {errors.name?.message && <p className={styles.error}>{errors.name.message}</p>}
            <label htmlFor="emailOrPhoneNumber">E-mail ou telefone</label>
            <input {...register("emailOrPhoneNumber")} type="text" id="emailOrPhoneNumber" placeholder="email ou telefone(+55 somente)" max={255}/>
            {status == 409 && <p className={styles.error}>Este {isEmail ? "email" : "telefone"} já esta sendo utilizado</p>}
            {errors.emailOrPhoneNumber?.message && <p className={styles.error}>{errors.emailOrPhoneNumber.message}</p>}
            <label htmlFor="password">Senha</label>
            <Password {...register("password")} id="password" placeholder="senha"/> 
            {errors.password?.message && <p className={styles.error}>{errors.password.message}</p>}
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <Password {...register("confirmPassword")} id="confirmPassword" placeholder="confirmar senha"/> 
            {errors.confirmPassword?.message && <p className={styles.error}>{errors.confirmPassword.message}</p>}
            <Link href="#">já possui uma conta?</Link>
            <button className={`${styles.login} ${load && styles.loading}`} type="submit">{load ? "cadastrando, aguarde" : "cadastrar"}</button>
          </form>
        </section>
      </main>
    </>
  )
}