import { Dispatch, SetStateAction } from 'react'
import Back from '../back/back'
import styles from './pix.module.css'

interface props {
  showPix: boolean
  setPaymentType: Dispatch<SetStateAction<"card" | "credit_card" | "debit_card" | "pix" | "boleto" | null>>
  paymentType: "card" | "credit_card" | "debit_card" | "pix" | "boleto" | null
  responseError: string | null
}

export default function Pix({showPix,setPaymentType,paymentType,responseError}:props) {
  return (
    <div className={`${!showPix && styles.displayNone} ${styles.div}`}>
      <Back handleBack={() => setPaymentType(null)} ariaLabel="Voltar para formas de pagamento" />
      <p className={`${styles.p}`}>Ao finalizar seu pedido você será redirecionado para efetuar seu pagamento via pix</p>
      {(paymentType == "pix" && responseError) && <p className={styles.error}>{responseError}</p>}
    </div>
  )
}