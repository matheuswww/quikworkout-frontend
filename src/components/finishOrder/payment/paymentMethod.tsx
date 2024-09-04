'use client'

import styles from './paymentMethod.module.css'
import CardImg from 'next/image'
import BoletoImg from 'next/image'
import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react'
import Card from './card/card'
import Pix from './pix/pix'
import PixImg from 'next/image'
import Boleto from './boleto/boleto'
import { boleto, card, enderecoContato } from '@/api/clothing/payOrderInterfaces'

interface props {
  showPayment: boolean
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
  retryPayment: string | null
  address: enderecoContato | null
  addressRef: MutableRefObject<HTMLElement | null>
  responseError3ds: string | null
  setIdTo3ds: Dispatch<SetStateAction<string | null>>
}

export default function PaymentMethod({ showPayment, cookieName, cookieVal, setError, setLoad, load, setCard, card, setPaymentType, paymentType, setBoleto, boleto, responseError, retryPayment, address, addressRef, responseError3ds, setIdTo3ds }:props) {
  return (
    <>
      {(paymentType == "card" || paymentType == "debit_card" || paymentType == "credit_card") && <Card responseError3ds={responseError3ds} setIdTo3ds={setIdTo3ds} addressRef={addressRef} address={address} responseError={responseError} paymentType={paymentType} card={card} showCard={showPayment} setCard={setCard} cookieName={cookieName} cookieVal={cookieVal} setError={setError} setLoad={setLoad} setPaymentType={setPaymentType} load={load} />}
      {(paymentType == "pix") && <Pix paymentType={paymentType} responseError={responseError} setPaymentType={setPaymentType} showPix={showPayment} />}
      {(paymentType == "boleto") && <Boleto paymentType={paymentType} responseError={responseError} boleto={boleto} setBoleto={setBoleto} setPaymentType={setPaymentType} showBoleto={showPayment} />}
      <div className={`${styles.container} ${(paymentType == "card" || paymentType == "credit_card" || paymentType == "debit_card" || paymentType == "pix" || paymentType == "boleto" || !showPayment) && styles.displayNone}`}>
        <button className={styles.paymentMethod} aria-label="pagar com cartão" onClick={() => setPaymentType("card")}>
          <p className={styles.p}>Cartão</p>
          <CardImg src="/img/card.png" alt="icone de um cartão" width={41} height={28}/>
        </button>
        {(retryPayment == "PIX" || retryPayment == null) && 
        <button className={styles.paymentMethod} aria-label="pagar com pix" onClick={() => setPaymentType("pix")} >
          <p className={styles.p}>Pix</p>
          <PixImg src="/img/pix.png" alt="icone do pix" width={41} height={41}/>
        </button>
        }
        <button className={styles.paymentMethod} aria-label="pagar boleto" onClick={() => setPaymentType("boleto")}>
          <p className={styles.p}>Boleto</p>
          <BoletoImg src="/img/boleto.png" alt="icone do boleto" width={41} height={41}/>
        </button>
      </div>
    </>
  )
}