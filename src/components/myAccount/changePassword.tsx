import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import styles from "./myAccount.module.css"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Password from "../authForm/password"
import ChangePassword from "@/api/auth/changePassword"

const schema = z.object({
  password: z.string().min(8,"senha precisa ter pelo menos 8 caracteres").max(72, "A senha deve ter no maxímo de 72 caracteres"),
  newPassword: z.string().min(8,"senha precisa ter pelo menos 8 caracteres").max(72, "A senha deve ter no maxímo de 72 caracteres")
})

type FormProps = z.infer<typeof schema>

interface props {
  setChanged: Dispatch<SetStateAction<boolean>>
  setPopupError: Dispatch<SetStateAction<boolean>>
  setLoad: Dispatch<SetStateAction<boolean>>
  changed: boolean
  cookieName?: string
  cookieVal?: string
}

export default function ChangePasswordForm({setChanged,setPopupError,setLoad,cookieName,cookieVal,changed}:props) {
  const router = useRouter()
  const [responseError, setResponseError] = useState<string | null>(null)
  const modalRef = useRef<HTMLFormElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  async function handleForm(data: FormProps) {
    setResponseError(null)
    setPopupError(false)
    setLoad(true)
    if(cookieName == undefined || cookieVal == undefined) {
      router.push("/auth/entrar")
      return
    }
    const cookie = cookieName+"="+cookieVal
    const res = await ChangePassword(cookie, {
      senhaNova: data.newPassword,
      senhaAntiga: data.password
    })
    if(typeof res == "number" && res == 200) {
      setChanged(true)
    }
    if(typeof res == "string" && (res == "as senhas são as mesmas" || res == "senha errada")) {
      setResponseError(res)
    }
    if(typeof res == "number" && res == 500) {
      setPopupError(true)
    }
    if((typeof res == "number" && res == 401) || (typeof res == "string" && res == "cookie inválido")) {
      router.push("/auth/entrar")
      return
    }
    setLoad(false)
  }

  useEffect(() => {
    if(changed) {
      closeRef.current?.click()
    }
  },[changed])

  return (
    <form className={`${styles.form}`} ref={modalRef} tabIndex={0} onSubmit={handleSubmit(handleForm)}>
      <div>
        <label htmlFor="current_password">Senha atual</label>
        <Password {...register("password")} id="current_password" placeholder="senha atual"/>
        {errors.password?.message && <p className={styles.error}>{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="new_password">Nova senha</label>
        <Password {...register("newPassword")} id="new_password" placeholder="nova senha"/>
        {errors.newPassword?.message && <p className={styles.error}>{errors.newPassword.message}</p>}
      </div>
      {!errors.password?.message && !errors.newPassword?.message && responseError && <p className={styles.error}>{responseError}</p>}
      <button type="submit" className={styles.buttonForm}>Confirmar</button>
      <button aria-label="fechar" type="button" className={styles.close} ref={closeRef}><span aria-hidden="true">x</span></button>
    </form>
  )
}