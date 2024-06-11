import { Dispatch, SetStateAction, useState } from "react"
import styles from './payment.module.css'
import ArrowUp from 'next/image'
import ArrowDown from 'next/image'
import PaymentMethod from "./paymentMethod"
import { boleto, card } from "../finishOrderForm"

interface props {
  cookieName?: string
  cookieVal?: string
  setError: Dispatch<boolean>
  setLoad: Dispatch<boolean>
  load: boolean
  setCard: Dispatch<card | null>
  card: card | null
  setBoleto: Dispatch<boleto | null>
  boleto: boleto | null
  setPaymentType: Dispatch<SetStateAction<"card" | "pix" | "boleto" | null>>
  paymentType: "card" | "pix" | "boleto" | null
}

export default function Payment({ cookieName, cookieVal, setError, setLoad, load, setCard, card, paymentType, setPaymentType, setBoleto, boleto }:props) {
  const [payment, setPayment] = useState<boolean>(true)
  
  return (
    <section className={styles.section}>
      <div style={{display: "flex"}}>
        {
          payment ? 
          <button className={styles.arrow} id="arrowPayment" onClick={(() => setPayment((a) => !a))} aria-label="diminuir sessão de pagamento"><ArrowUp src="/img/arrowUp.png" alt="seta para cima" width={24} height={24} /></button>
          :
          <button className={styles.arrow} id="arrowPayment" onClick={(() => setPayment((a) => !a))} aria-label="expandir sessão de pagamento"><ArrowDown src="/img/arrowDown.png" alt="seta para baixo" width={24} height={24}/></button>
        }
        <label htmlFor="arrowPayment" className={styles.label} >Formas de pagamento</label>
      </div>
      <PaymentMethod card={card} setBoleto={setBoleto} paymentType={paymentType} setPaymentType={setPaymentType} boleto={boleto} setCard={setCard} load={load} showPayment={payment} cookieName={cookieName} cookieVal={cookieVal} setError={setError} setLoad={setLoad} />
    </section>
  )
}