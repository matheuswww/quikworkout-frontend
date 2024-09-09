import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from "react"
import styles from "./myAccount.module.css"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import RecaptchaForm from "@/funcs/recaptchaForm"
import Recaptcha from "../recaptcha/recaptcha"
import { ValidateEmail, ValidatePhoneNumber } from "@/funcs/validateEmailAndPhoneNumber"
import UpdateProfile from "@/api/auth/updateProfile"
import Password from "../authForm/password"
import { deleteCookie } from "@/action/deleteCookie"
import { getUserResponse } from "@/api/user/getUser"

const schema = z.object({
  password: z.string().min(8,"senha precisa ter pelo menos 8 caracteres").max(72, "A senha deve ter no maxímo de 72 caracteres"),
  name: z.string().optional().refine((value) => {
    if(value && value != "") {
      return value.length >= 2 && value.length <= 20
    }
    return true
  }, {
    message: "nome precisa ter entre 2 e 20 caracteres",
  }),
  emailOrPhoneNumber: z.string().optional().refine((value) => {
  if(value && value != "") {
    if(value.includes("@")) {
      return ValidateEmail(value)
    }
    return ValidatePhoneNumber(value)
  }
  return true
  },{
    message: "email ou telefone inválido"
  })
})

type FormProps = z.infer<typeof schema>

interface props {
  setLoad: Dispatch<SetStateAction<boolean>>
  modalRef: MutableRefObject<HTMLFormElement | null>
  closeRef: MutableRefObject<HTMLButtonElement | null>
  setPopupError: Dispatch<SetStateAction<boolean>>
  cookieName?: string
  cookieVal?: string
  type: "contact" | "name" | null
  activeRecaptcha: "updateProfile" | "changePassword" | null
  setData: Dispatch<SetStateAction<getUserResponse | null>>
  load: boolean
}

export default function UpdateProfileForm({setPopupError,setLoad,cookieName,cookieVal,modalRef,closeRef,type,activeRecaptcha,setData,load}:props) {
  const router = useRouter()
  const [responseError, setResponseError] = useState<string | null>(null)

  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if(type == "name") {
      setValue("emailOrPhoneNumber", "")
    }
    if(type == "contact") {
      setValue("name", "")
    }   
  },[type])

  async function handleForm(data: FormProps) {
    setRecaptchaError(null)
    setResponseError(null)
    setPopupError(false)

    if(data.emailOrPhoneNumber == "" && data.name == "") {
      if(type == "contact") {
        setResponseError("email ou telefone inválido")
        setError("emailOrPhoneNumber", {
          message: ""
        })
      } else {
        setResponseError("nome precisa ter entre 2 e 20 caracteres")
        setError("name", {
          message: ""
        })
      }
      return
    }
    const token = RecaptchaForm(setRecaptchaError)
    if(token == "") {
      return
    }
    setLoad(true)
    if(cookieName == undefined || cookieVal == undefined) {
      await deleteCookie("userProfile")
      router.push("/auth/entrar")
      return
    }
    const cookie = cookieName+"="+cookieVal
    const newEmail = data.emailOrPhoneNumber ? data.emailOrPhoneNumber.includes("@") ? data.emailOrPhoneNumber : "" : ""
    const newTelefone = data.emailOrPhoneNumber ? !data.emailOrPhoneNumber.includes("@") ? data.emailOrPhoneNumber : "" : ""
    const newName = data.name ? data.name : ""

    const res = await UpdateProfile(cookie, {
      email: newEmail,
      telefone: newTelefone,
      nome: newName,
      senha: data.password,
      token: token
    })
    if(res == "senha errada") {
      setResponseError("senha inválida")
    }
    if(res == "contato já utilizado") {
      setResponseError(res)
    }
    if(res == 500) {
      setPopupError(true)
    }
    if(res == 401) {
      await deleteCookie("userProfile")
      router.push("/auth/entrar")
      return
    }

    let reload = false
    if(res == 200) {
      setData((d) => {
        if(d?.data) {
        return {
          status: 200,
          data: {
            email: newEmail != "" || newTelefone != "" ? newEmail : d.data.email,
            nome: newName != "" ? newName : d.data.nome,
            telefone: newTelefone != "" && newTelefone != "" ? newTelefone : d.data.telefone,
            twoAuthEmail: d.data.twoAuthEmail,
            twoAuthTelefone: d.data.twoAuthTelefone,
            verificado: d.data.verificado,
          }
        }
      }
      reload = true
      if(!reload) {
        window.location.reload()
      }
      return d
    })
    closeRef.current instanceof HTMLButtonElement && closeRef.current.click()
    }
    setLoad(false)
  }
 
  return (
    <form className={`${styles.form}`} id={`${load && styles.lowOpacity}`} ref={modalRef} tabIndex={0} onSubmit={handleSubmit(handleForm)}>
      {type == "contact" ? <div>
          <label htmlFor="new_contact">Novo contato(email ou telefone)</label>
          <input {...register("emailOrPhoneNumber")} id="new_contact" placeholder="email ou telefone(+55 somente)"/>
          {errors?.emailOrPhoneNumber?.message && <p className={styles.error}>{errors.emailOrPhoneNumber.message}</p>}
        </div>
        :
        <div>
          <label htmlFor="new_name">Novo nome</label>
          <input {...register("name")} id="new_name" placeholder="novo nome"/>
          {errors?.name?.message && <p className={styles.error}>{errors.name.message}</p>}
        </div>
      }
      <div style={{marginTop: "15px"}}>
        <label htmlFor="password">Sua senha</label>
        <Password {...register("password")} id="password" placeholder="senha"/>
        {errors.password?.message && <p className={styles.error}>{errors.password.message}</p>}
      </div>
      {!errors.password?.message && !errors.emailOrPhoneNumber?.message && !errors.name?.message && responseError && <p className={styles.error}>{responseError}</p>}
      {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
      {activeRecaptcha == "updateProfile" && <Recaptcha className={styles.recaptcha} />}
      <button type="submit" className={`${styles.button} ${styles.confirm}`}>Confirmar</button>
      <button aria-label="fechar" type="button" className={styles.close} ref={closeRef}><span aria-hidden="true">x</span></button>
    </form>
  )
}