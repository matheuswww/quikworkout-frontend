import { Dispatch, MutableRefObject, SetStateAction, useState } from "react"
import styles from './payment.module.css'
import ArrowUp from 'next/image'
import ArrowDown from 'next/image'
import PaymentMethod from "./paymentMethod"
import { boleto, card } from "@/api/clothing/payOrderInterfaces"

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
  setPaymentType: Dispatch<SetStateAction<"card" | "credit_card" | "debit_card" | "pix" | "boleto" | null>>
  paymentType: "card" | "credit_card" | "debit_card" | "pix" | "boleto" | null
  responseError: string | null
  paymentRef:  MutableRefObject<HTMLElement | null>
  retryPayment: string | null
}

export default function Payment({ cookieName, cookieVal, setError, setLoad, load, setCard, card, paymentType, setPaymentType, setBoleto, boleto, responseError,paymentRef,retryPayment }:props) {
  const [payment, setPayment] = useState<boolean>(true)
  
  return (
    <section className={styles.section} ref={paymentRef}>
      <div style={{display: "flex"}}>
        {
          payment ? 
          <button className={styles.arrow} id="arrowPayment" type="button" onClick={(() => setPayment((a) => !a))} aria-label="diminuir sessão de pagamento"><ArrowUp src="/img/arrowUp.png" alt="seta para cima" width={24} height={24} /></button>
          :
          <button className={styles.arrow} id="arrowPayment" type="button" onClick={(() => setPayment((a) => !a))} aria-label="expandir sessão de pagamento"><ArrowDown src="/img/arrowDown.png" alt="seta para baixo" width={24} height={24}/></button>
        }
        <label htmlFor="arrowPayment" className={styles.label} >Formas de pagamento</label>
      </div>
      <PaymentMethod retryPayment={retryPayment} responseError={responseError} card={card} setBoleto={setBoleto} paymentType={paymentType} setPaymentType={setPaymentType} boleto={boleto} setCard={setCard} load={load} showPayment={payment} cookieName={cookieName} cookieVal={cookieVal} setError={setError} setLoad={setLoad} />
    </section>
  )
}