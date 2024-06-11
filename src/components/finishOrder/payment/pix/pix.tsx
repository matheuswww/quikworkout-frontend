import { Dispatch } from 'react'
import Back from '../back/back'
import styles from './pix.module.css'

interface props {
  showPix: boolean
  setPaymentType: Dispatch<"card" | "pix" | "boleto" | null>
}

export default function Pix({showPix, setPaymentType}:props) {
  return (
    <div className={`${!showPix && styles.displayNone} ${styles.div}`}>
      <Back handleBack={() => setPaymentType(null)} ariaLabel="Voltar para formas de pagamento" />
      <p className={`${styles.p}`}>Ao finalizar seu pedido você será redirecionado para efetuar seu pagamento via pix</p>
    </div>
  )
}