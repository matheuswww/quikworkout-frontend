import { Dispatch, MutableRefObject, SetStateAction } from "react"
import styles from "./myAccount.module.css"
import { useRouter } from "next/navigation"
import { getAddressData } from "@/api/user/getAddress"
import DeleteAddress from "@/api/user/deleteAddress"
import { deleteCookie } from "@/action/deleteCookie"

interface props {
  setLoad: Dispatch<SetStateAction<boolean>>
  modalRef: MutableRefObject<HTMLFormElement | null>
  closeRef: MutableRefObject<HTMLButtonElement | null>
  cookieName?: string
  cookieVal?: string
  deleteAddress: getAddressData | null
  load: boolean
}

export default function DeleteAddressForm({modalRef,closeRef,cookieName,cookieVal,deleteAddress,setLoad,load}:props) {
  const router = useRouter()
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
        await deleteCookie("userProfile")
        router.push("/auth/entrar")
        return
      }
      window.location.reload()
    }
  }

  return (
    <form className={styles.deleteAddress} id={`${load && styles.lowOpacity}`} ref={modalRef} onSubmit={handleDeleteAddressForm}>
      <p>Tem certeza que deseja deletar este item?</p>
      <button type="submit" className={styles.deleteAddressButton}>Deletar</button>
      <button aria-label="fechar" type="button" className={styles.close} ref={closeRef}><span aria-hidden="true">x</span></button>
    </form>
  )
}