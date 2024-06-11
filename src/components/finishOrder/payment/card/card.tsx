'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import styles from './card.module.css'
import Back from '../back/back'
import Create3DSSession, { create3DSSessionData } from '@/api/order/create3DSSession'
import { useRouter } from 'next/navigation'
import { card } from '../../finishOrderForm'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface props {
  cookieName?: string
  cookieVal?: string
  setPaymentType: Dispatch<SetStateAction<"card" | "pix" | "boleto" | null>>
  setError: Dispatch<boolean>
  setLoad: Dispatch<boolean>
  showCard: boolean
  load: boolean
  setCard: Dispatch<card | null>
  card: card | null
}

const schema = z.object({
  cardNumber: z.string().regex(/(?:\d[\s-]*?){13,16}|(?:\d[\s-]*?){15}|(?:\d[\s-]*?){14}|(?:\d[\s-]*?){16,19}/, "número de cartão inválido"),
  holder: z.string().min(1, "titular do cartão inválido").max(100, "titular do cartão inválido"),
  cvv: z.string().min(1,"cvv").max(4,"cvv"),
  expMonth: z.string(),
  expYear: z.string(),
  installments: z.string()
})

type FormProps = z.infer<typeof schema>

export default function Card({ setPaymentType,showCard,setError,setLoad, cookieName, cookieVal, load, setCard, card  }:props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(schema)
  })
  const router = useRouter()
  const [cardType, setCardType] = useState<"credito" | "debito" | null>(null)
  const [next, setNext] = useState<boolean>(false)
  const [Id3DS, setId3DS] = useState<string | null>(null)
  const [saved,setSaved] = useState<boolean>(false)

  useEffect(() => {
    if(cardType == "debito") {
      (async function() {
        if(cookieName == undefined || cookieVal == undefined) {
          router.push("/auth/entrar")
          return
        }
        const cookie = cookieName+"="+cookieVal
        setLoad(true)
        const data = await Create3DSSession(cookie)   
        if(data == "contato não verificado") {
          router.push("/auth/validar-contato")
          return
        }
        if(data == "cookie inválido") {
          router.push("/auth/entrar")
          return
        }
        if(data == 500) {
          setLoad(false)
          setError(true)
          return
        }
        setId3DS(data.session)
        setLoad(false)
        setNext(true)
      }())
    } else if (cardType == "credito") {
      setNext(true)
    }
  }, [cardType])

  function handleForm(data: FormProps) {
    let expMonth = Number(data.expMonth)
    let installments = Number(data.installments)
    let threedsId = Id3DS
    if(cardType == "debito" && threedsId == null) {
      setError(false)
      return
    }
    if(!isNaN(expMonth) && !isNaN(installments)) {
      setCard({
        nome: data.holder,
        numeroCartao: data.cardNumber,
        cvv: data.cvv,
        expAno: data.expYear,
        expMes: expMonth,
        parcelas: installments,
        id3DS: threedsId
      })
      setSaved(true)
    } else {
      setError(true)
    }
  }

  return (
    !next ?
      <div className={`${styles.selectCard} ${!showCard && styles.displayNone}`}>
        <Back handleBack={() => setPaymentType(null)} ariaLabel="Voltar para formas de pagamento" />
        <p className={styles.p}>Tipo de cartão</p>
        <button disabled={load} type="button" className={styles.button} onClick={() => setCardType("debito")}>Débito</button><button disabled={load} type="button" className={styles.button} onClick={() => setCardType("credito")}>Crédito</button>
      </div>
    :
    !saved ?
      <form className={`${styles.form} ${!showCard && styles.displayNone}`} onSubmit={handleSubmit(handleForm)}>
      <Back handleBack={() => {setNext(false);setLoad(false);setCardType(null)}} ariaLabel="Voltar para tipo de cartão" />
      <label className={styles.label} htmlFor="cardNumber">Número do cartão</label>
      <input {...register("cardNumber")} type="text" placeholder="número do cartão" id="cardNumber"/>
      {errors.cardNumber && <p className={styles.error}>{errors.cardNumber.message}</p>}
      <label className={styles.label} htmlFor="name">Nome do titular</label>
      <input {...register("holder")} type="text" placeholder="titular do cartão" id="name"/>
      {errors.holder && <p className={styles.error}>{errors.holder.message}</p>}
      <label className={styles.label} htmlFor="cvv">Cvv</label>
      <input {...register("cvv")} type="text" placeholder="código do cartão" id="cvv"/>
      {errors.cvv && <p className={styles.error}>{errors.cvv.message}</p>}
      <label className={`${styles.label}`} htmlFor="expMonth">Mês de expiração</label>
      <select id="expMonth" {...register("expMonth")}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
      </select>
      <label className={`${styles.label}`} htmlFor="expYear">Ano de expiração</label>
      <select id="expYear" {...register("expYear")}>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
        <option value="2027">2027</option>
        <option value="2028">2028</option>
        <option value="2029">2029</option>
        <option value="2030">2030</option>
        <option value="2031">2031</option>
        <option value="2032">2032</option>
        <option value="2033">2033</option>
        <option value="2034">2034</option>
        <option value="2035">2040</option>
      </select>
      {cardType == "credito" &&
        <>
          <label className={`${styles.label}`} htmlFor="installments" {...register("installments")}>Parcelas</label>
          <select id="installments" {...register("installments")}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </>
      }
      <button className={styles.button} type="submit">Salvar dados do cartão</button>
    </form>
    : 
    card &&
    <div className={`${!showCard && styles.displayNone}`} style={{display: "grid"}}>
      <div className={styles.values}>
        <p className={styles.field}>Número cartão: </p>
        <p className={styles.value}>{card.numeroCartao}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Nome do titular: </p>
        <p className={styles.value}>{card.nome}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Cvv: </p>
        <p className={styles.value}>{card.cvv}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Mês de expiração: </p>
        <p className={styles.value}>{card.expMes}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Ano de expiração: </p>
        <p className={styles.value}>{card.expAno}</p>
      </div>
      {cardType == "credito" && 
        <div className={styles.values}>
          <p className={styles.field}>Parcelas: </p>
          <p className={styles.value}>{card.parcelas}</p>
        </div>
      }
      <button className={styles.button} onClick={() => setSaved(false)} style={{marginRight: "15px"}}>Editar dados do cartão</button>
    </div>
  )
}