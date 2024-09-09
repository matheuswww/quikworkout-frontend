import React, { Dispatch, MutableRefObject, SetStateAction, SyntheticEvent, useState } from "react"
import styles from "./getOrder.module.css"
import UpdateTrackingCode, { packages } from "@/api/manager/profile/updateTrackingCode"
import { useRouter } from "next/navigation"
import { getOrderAdmin } from "@/api/manager/clothing/getOrder"
import { packageNumbers } from "./getOrder"

interface props {
  setSuccess: Dispatch<SetStateAction<boolean>>
  setLoad: Dispatch<boolean>
  setPopupError: Dispatch<boolean>
  setData: Dispatch<SetStateAction<getOrderAdmin | null>>
  modalRef: MutableRefObject<HTMLFormElement | null>
  closeRef: MutableRefObject<HTMLButtonElement | null>
  cookieName?: string
  cookieVal?: string
  order_id: string | null
  packageNumbers: packageNumbers[] | null
}

export default function UpdateTrackingCodeForm({modalRef,closeRef,cookieName,cookieVal,setLoad,order_id,setSuccess,setPopupError,setData,packageNumbers}:props) {
  const [responseError, setResponseError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setPopupError(false)
    setResponseError(null)
    let rp: boolean = false
    let packages: Array<packages> = []
    if(modalRef.current instanceof HTMLFormElement) {
      const inputs = modalRef.current.querySelectorAll("input")
      inputs.forEach((i) => {
        if(i.value.length < 10 || i.value.length > 10) {
          setResponseError("todos os códigos devem conter 10 caracteres")
          rp = true
          return
        }
        const id = i.id
        if(isNaN(Number(id))) {
          return
        }
        console.log(i.value);
        
        if(packages) {
          const newPk = packages
          newPk.push({
            codigoRastreio: i.value,
            numeroPacote: Number(id)
          })
          return newPk
        }
        return [{
          codigoRastreio: i.value,
          numeroPacote: Number(id)
        }]
      })
    }
    if (rp || !packages) {
      return
    }
    if(cookieName == undefined || cookieVal == undefined) {
      router.push("/manager-quikworkout/auth")
      return
    }
    if(order_id == null) {
      setPopupError(true)
      return
    }
    setLoad(true)
    console.log(packages);
    
    const cookie = cookieName+"="+cookieVal
    const res = await UpdateTrackingCode(cookie, {
      pedido_id: order_id,
      pacotes: packages
    })

    if(res == 401) {
      router.push("/manager-quikworkout/auth")
      return
    }
    if(res == 500) {
      setPopupError(true)
    }
    if(res == 404) {
      setResponseError("pedido não encontrado, tente recarregar a página")
    }
    if(res == 200) {
      setSuccess(true)
      if(closeRef.current instanceof HTMLButtonElement) {
        closeRef.current.click()
      }
      setData((data) => {
        const newOrder = data?.order?.pedido.filter((val) => {
          if(order_id != val.pedido_id) {
            return true
          }
          return false
        })
        if(newOrder && data?.order?.pedido) {
          data.order.pedido = newOrder
        }
        return data
      })
    }
    setLoad(false)
  }

  return (
    <form tabIndex={0} className={styles.modal} ref={modalRef} onSubmit={handleSubmit}>
      <p className={styles.p}>Código de rastreio</p>
      {packageNumbers?.map((p) => {
        return (
          <React.Fragment key={Math.random()}>
            {packageNumbers.length > 1 && <label htmlFor={`${p.package_number}`}>Pacote {p.package_number + 1}</label>}
            <input id={`${p.package_number}`} placeholder="código de rastreio" />
          </React.Fragment>
        )
      })}
      {responseError && <p className={styles.error}>{responseError}</p>}
      <button type="submit" className={`${styles.modalButton} ${styles.button}`}>Enviar</button>
      <button aria-label="fechar" type="button" className={`${styles.close} ${styles.button}`} ref={closeRef}><span aria-hidden="true">x</span></button>
    </form>
  )
}