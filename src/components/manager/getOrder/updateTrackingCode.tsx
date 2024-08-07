import { Dispatch, MutableRefObject, SetStateAction } from "react"
import styles from "./getOrder.module.css"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import UpdateTrackingCode from "@/api/manager/profile/updateTrackingCode"
import { useRouter } from "next/navigation"
import { getOrderAdmin } from "@/api/manager/clothing/getOrder"

interface props {
  setLoad: Dispatch<boolean>
  setOrderId: Dispatch<string | null>
  setPopupError: Dispatch<boolean>
  setResponseError: Dispatch<string | null>
  setData: Dispatch<SetStateAction<getOrderAdmin | null>>
  modalRef: MutableRefObject<HTMLFormElement | null>
  closeRef: MutableRefObject<HTMLButtonElement | null>
  cookieName?: string
  cookieVal?: string
  order_id: string | null
  error: string | null
}

const schema = z.object({
  codigo_rastreio: z.string().min(10, "código inválido").max(10, "código inválido")
})

type FormProps = z.infer<typeof schema>

export default function UpdateTrackingCodeForm({modalRef,closeRef,cookieName,cookieVal,setLoad,order_id,setOrderId,setPopupError,error,setResponseError,setData}:props) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  async function handleForm(formData: FormProps) {
    setPopupError(false)
    setResponseError(null)
    if(closeRef.current instanceof HTMLButtonElement) {
      closeRef.current.click()
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
    const cookie = cookieName+"="+cookieVal
    const res = await UpdateTrackingCode(cookie, {
      pedido_id: order_id,
      codigo_rastreio: formData.codigo_rastreio
    })

    setOrderId(null)
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
    <form tabIndex={0} className={styles.modal} ref={modalRef} onSubmit={handleSubmit(handleForm)}>
      <label htmlFor="tracking_code">Código de rastreio</label>
      <input {...register("codigo_rastreio")} id="tracking_code" placeholder="código de rastreio" />
      {errors.codigo_rastreio?.message ? <p className={styles.error}>{errors.codigo_rastreio.message}</p> : error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={`${styles.modalButton} ${styles.button}`}>Enviar</button>
      <button aria-label="fechar" type="button" className={`${styles.close} ${styles.button}`} ref={closeRef}><span aria-hidden="true">x</span></button>
    </form>
  )
}