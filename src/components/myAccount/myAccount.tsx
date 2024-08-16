"use client"

import { useEffect, useRef, useState } from "react"
import SpinLoading from "../spinLoading/spinLoading"
import { useRouter } from "next/navigation"
import GetUser, { getUserResponse } from "@/api/user/getUser"
import { deleteCookie } from "@/action/deleteCookie"
import styles from "./myAccount.module.css"
import Link from "next/link"
import Password from "../authForm/password"
import handleModalClick from "@/funcs/handleModalClick"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import ChangePassword from "@/api/auth/changePassword"
import PopupError from "../popupError/popupError"
import ArrowUp from 'next/image'
import ArrowDown from 'next/image'
import GetAddress, { getAddressData } from "@/api/user/getAddress"
import DeleteAddress from "@/api/user/deleteAddress"
import Menu from "../menu/menu"
import Recaptcha from "../recaptcha/recaptcha"
import RecaptchaForm from "@/funcs/recaptchaForm"

const schema = z.object({
  password: z.string().min(8,"Nova senha precisa ter pelo menos 8 caracteres").max(72, "A nova senha deve ter no maxímo de 72 caracteres"),
  newPassword: z.string().min(8,"Nova senha precisa ter pelo menos 8 caracteres").max(72, "A nova senha deve ter no maxímo de 72 caracteres")
})

type FormProps = z.infer<typeof schema>

interface props {
  cookieName?: string
  cookieVal?: string
}

export default function MyAccount({cookieName, cookieVal}:  props) {
  const router = useRouter()
  const [addressData, setAddressData] = useState<getAddressData[] | null>(null)
  const [data, setData] = useState<getUserResponse | null>(null)
  const [load, setLoad] = useState<boolean>(true)
  const [popupError, setPopupError] = useState<boolean>(false)
  const [responseError, setResponseError] = useState<string | null>(null)
  const [changed, setChanged] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [deleteAddress, setDeleteAddress] = useState<getAddressData | null>(null)
  const modalRef = useRef<HTMLFormElement | null>(null)
  const buttonToOpenModalRef = useRef<HTMLButtonElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)

  const formDeleteAddressRef = useRef<HTMLFormElement | null>(null)
  const buttonToOpenFormDeleteAddressRef = useRef<HTMLButtonElement | null>(null)
  const closeRefDeleteAddress = useRef<HTMLButtonElement | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    (async function() {
      setLoad(true)
      if(cookieName == undefined || cookieVal == undefined) {
        router.push("/auth/entrar")
        return
      }
      const cookie = cookieName+"="+cookieVal
      const res = await GetUser(cookie)
      if(res.status == 404 || res.status == 401) {
        await deleteCookie(cookieName)
        router.push("/auth/entrar")
        return
      }
      setData(res)
    }())
  }, [])

  useEffect(() => {
    (async function() {
      if(cookieName == undefined || cookieVal == undefined) {
        router.push("/auth/entrar")
        return
      }
      setLoad(true)
      const cookie = cookieName+"="+cookieVal
      const res = await GetAddress(cookie)
      if(typeof res.status == "number" && res.status == 401) {
        router.push("/auth/entrar")
        return
      }
      setAddressData(res.data)
      setLoad(false)
    }())
  }, [])

  useEffect(() => {
    if(changed) {
      closeRef.current?.click()
    }
  },[changed])

  function changeDeleteAddress(address: getAddressData) {
    setDeleteAddress({
      bairro: address.bairro,
      cep: address.cep,
      cidade: address.cidade,
      codigoRegiao: address.codigoRegiao,
      complemento: address.complemento,
      numeroResidencia: address.numeroResidencia,
      rua: address.rua,
      regiao: address.regiao
    })
  }

  async function handleForm(data: FormProps) {
    setRecaptchaError(null)
    setResponseError(null)
    setPopupError(false)
    const token = RecaptchaForm(setRecaptchaError)
    if(token == "") {
      return
    }
    setLoad(true)
    if(cookieName == undefined || cookieVal == undefined) {
      router.push("/auth/entrar")
      return
    }
    const cookie = cookieName+"="+cookieVal
    const res = await ChangePassword(cookie, {
      senhaNova: data.newPassword,
      senhaAntiga: data.password,
      token: token
    })
    if(typeof res == "number" && res == 200) {
      setChanged(true)
    }
    if (typeof res == "string" && res == "recaptcha inválido") {
      setRecaptchaError(res)
      //@ts-ignore
      window.grecaptcha.reset()
    }
    if(typeof res == "string" && (res == "as senhas são as mesmas" || res == "senha errada")) {
      if(res == "senha errada") {
        setResponseError("senha inválida")
      } else {
        setResponseError(res)
      }
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
  
  async function handleDeleteAddressForm() {
    if(deleteAddress) {
      if(cookieName == undefined || cookieVal == undefined) {
        router.push("/auth/entrar")
        return
      }
      const cookie = cookieName+"="+cookieVal
      setLoad(true)
      const res = await DeleteAddress(cookie,{
        bairro: deleteAddress.bairro,
        cep: deleteAddress?.cep,
        cidade: deleteAddress?.cidade,
        codigoRegiao: deleteAddress?.codigoRegiao,
        complemento: deleteAddress?.complemento,
        numeroResidencia: deleteAddress?.numeroResidencia,
        rua: deleteAddress?.rua
      })
      if(res === 401) {
        router.push("/auth/entrar")
        return
      }
      window.location.reload()
    }
  }

  return (
    <>
      <header>
        <Menu cookieName={cookieName} cookieVal={cookieVal} />
      </header>
      {load && <SpinLoading />}
      {popupError && <PopupError handleOut={() => setPopupError(false)}/>}
      <main className={`${load && styles.lowOpacity} ${styles.main}`}>
        <form className={`${styles.form}`} ref={modalRef} tabIndex={0} onSubmit={handleSubmit(handleForm)}>
          <div>
            <label htmlFor="current_password">Senha atual</label>
            <Password {...register("password")} id="current_password" placeholder="senha atual"/>
            {errors.password?.message && <p className={styles.error}>{errors.password.message}</p>}
          </div>
          <div className={styles.newPassword}>
            <label htmlFor="new_password">Nova senha</label>
            <Password {...register("newPassword")} id="new_password" placeholder="nova senha"/>
            {errors.newPassword?.message && <p className={styles.error}>{errors.newPassword.message}</p>}
          </div>
          {!errors.password?.message && !errors.newPassword?.message && responseError && <p className={styles.error}>{responseError}</p>}
          {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
          <Recaptcha className={styles.recaptcha} />
          <button type="submit" className={`${styles.button} ${styles.confirm}`}>Confirmar</button>
          <button aria-label="fechar" type="button" className={styles.close} ref={closeRef}><span aria-hidden="true">x</span></button>
        </form>
        <form className={styles.deleteAddress} ref={formDeleteAddressRef} onSubmit={handleDeleteAddressForm}>
          <p>Tem certeza que deseja deletar este item?</p>
          <button type="submit" ref={closeRefDeleteAddress} className={styles.deleteAddressButton}>Deletar</button>
          <button aria-label="fechar" type="button" className={styles.close} ref={closeRefDeleteAddress}><span aria-hidden="true">x</span></button>
        </form>
        {
        <section className={`${styles.section} ${(data?.status == 500 || data?.status == 404) && styles.center}`}>
          {data?.status == 200 && data.data ?
          <>
          <h1 className={styles.title}>Minha conta</h1>
            <div className={styles.vals}>
              <p>Nome: </p>
              <p>{data.data.nome}</p>
            </div>
          {
            data.data.email !=  "" ?
            <div className={`${styles.vals} ${styles.email}`}>
              <p>Email: </p>
              <p>{data.data.email}</p>
            </div>
            :
            <div className={styles.vals}>
              <p>Telefone: </p>
              <p>{data.data.telefone}</p>
            </div>
          }
          {
            (data.data.twoAuthEmail != "" || data.data.twoAuthTelefone != "") ?
            (
              data.data.twoAuthEmail != "" ?
              <>
                <div className={styles.vals}>
                  <p>Email de dois fatores: </p>
                  <p>{data.data.twoAuthEmail}</p>
                </div>
                <Link href="/auth/remover-dois-fatores" className={styles.link}>Remover autenticação de dois fatores</Link>
              </>
              :
              <>
                <div className={styles.vals}>
                  <p>Telefone de dois fatores: </p>
                  <p>{data.data.twoAuthTelefone}</p>
                </div>
                <Link href="/auth/remover-dois-fatores" className={styles.link}>Remover autenticação de dois fatores</Link>
              </>
            )
            :
            <Link href="/auth/criar-dois-fatores" className={styles.link}>Adicionar autenticação de dois fatores</Link>
          }
          {
            !data.data.verificado &&
            <Link href="/auth/validar-contato" className={styles.link}>Confirmar {data.data.email != "" ? "email" : "telefone"}</Link>
          }
          {
            addressData && 
            <>
              <div className={styles.address}>
            {
              !open ?
              <button className={styles.arrow} id="arrowAddress" onClick={(() => setOpen((a) => !a))}  aria-label="expandir sessão de endereços de entrega salvos"><ArrowUp src="/img/arrowUp.png" alt="seta para cima" width={24} height={24}/></button>
              :
              <button className={styles.arrow} id="arrowAddress" onClick={(() => setOpen((a) => !a))} aria-label="diminuir sessão de endereços de entrega salvos"><ArrowDown src="/img/arrowDown.png" alt="seta para baixo" width={24} height={24}/></button>
            }
            <label htmlFor="arrowAddress" className={styles.arrowLabel}>Endereços de entrega</label>
            </div>
            {
              !open && addressData.map((infos,i) => {
                return (
                <div className={styles.addressItem} key={i} id={`address_${i}`}>
                  <div className={styles.vals}>
                    <p>Rua: </p>
                    <p>{infos.rua}</p>
                  </div>
                  <div className={styles.vals}>
                    <p>Número de residênia: </p>
                    <p>{infos.numeroResidencia}</p>
                  </div>
                  <div className={styles.vals}>
                    <p>Complemento: </p>
                    <p>{infos.complemento}</p>
                  </div>
                  <div className={styles.vals}>
                    <p>Bairro: </p>
                    <p>{infos.bairro}</p>
                  </div>
                  <div className={styles.vals}>
                    <p>Cidade: </p>
                    <p>{infos.cidade}</p>
                  </div>
                  <div className={styles.vals}>
                    <p>Código de região: </p>
                    <p>{infos.codigoRegiao}</p>
                  </div>
                  <div className={styles.vals}>
                    <p>Cep: </p>
                    <p>{infos.cep}</p>
                  </div>
                  <button aria-label="fecha
                     r" type="button" className={styles.close} ref={buttonToOpenFormDeleteAddressRef} onClick={() => {
                    handleModalClick(formDeleteAddressRef, buttonToOpenFormDeleteAddressRef, closeRefDeleteAddress, styles.active, "block")
                    changeDeleteAddress({...infos,})
                  }}><span aria-hidden="true">x</span></button>
              </div>
              )
              })
            }
            </>
          }
          {!changed ? <button className={`${styles.button} ${styles.changePassword}`} ref={buttonToOpenModalRef} onClick={() => handleModalClick(modalRef, buttonToOpenModalRef, closeRef, styles.active, "grid")}>Alterar senha</button> : <p className={styles.changed}>Senha alterada com sucesso</p>}
          </>
         : load ? <>
          <h1 className={styles.title}>Minha conta</h1>
          <p className={styles.loading}>carregando...</p>
         </> : <p className={styles.serverError}>Parece que houve um erro! Tente recarregar a página</p>}
        </section>
        }
      </main>
    </>
  )
}