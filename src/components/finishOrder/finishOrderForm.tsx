'use client'

import { useEffect, useState } from 'react'
import styles from './finishOrderForm.module.css'
import GetClothingCart, { getClothingCartResponse } from '@/api/clothing/getClothingCart'
import { useRouter } from 'next/navigation'
import { deleteCookie } from '@/action/deleteCookie'
import SpinLoading from '../spinLoading/spinLoading'
import PopupError from '../popupError/popupError'
import Link from 'next/link'
import CalcFreightForm from './calcFreight'
import Payment from './payment/payment'
import Address from './address'
import Products from './products'
import formatPrice from '@/funcs/formatPrice'

interface props {
  cookieName?: string
  cookieVal?: string
  page?: number
  clothing_id?: string
  color?: string
  size?: string
}

export interface card {
	nome: string
	numeroCartao: string
  expMes: number
	expAno: string
	cvv: string
  parcelas: number
	id3DS: string | null
}

export interface boleto {
  dataVencimento: string
  linhasInstrucao: instructionLine
  titularBoleto: holderBoleto 
}

interface holderBoleto {
  nome: string
  cpfCnpj: string
  email: string
  endereco: enderecoBoleto | null
}

interface instructionLine {
  linha_1: string
  linha_2: string
}

export interface enderecoBoleto {
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  codigoRegiao: string
  regiao: string
  cep: string
}


export interface enderecoContato {
  nome: string
  email: string
  telefone: string
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  codigoRegiao: string
  regiao: string
  cep: string
  cpfCnpj: string
}

export default function FinishPurchaseForm({...props}: props) {
  const router = useRouter()

  const [delivery, setDelivery] = useState<"E" | "X" | "R">("E")
  const [data, setData] = useState<getClothingCartResponse | null>(null)
  const [popupError, setPopupError] = useState<boolean>(false)
  const [load, setLoad] = useState<boolean>(true)
  const [requests, setRequests] = useState<number>(0)
  const [end, setEnd] = useState<boolean>(false)

  const [freight, setFreight] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<"card" | "pix" | "boleto" | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [card, setCard] = useState<card | null>(null)
  const [boleto, setBoleto] = useState<boleto | null>(null)
  const [address, setAddress] = useState<enderecoContato | null>(null)
  
  useEffect(() => {
    if(!end) {
      if(props.page == undefined || isNaN(props.page) || requests == props.page) {
        setEnd(true)
      }
      (async function() {
        if(props.cookieName == undefined || props.cookieVal == undefined) {
          router.push("/auth/entrar")
          return
        }
        const cookie = props.cookieName+"="+props.cookieVal
        var cursor: string | undefined
        if(data?.clothing) {
          const lastIndex = data.clothing.length
          if(lastIndex && lastIndex - 1 >= 0 && data.clothing) {
            cursor = data.clothing[lastIndex - 1].criado_em
          }
        }
        const res = await GetClothingCart(cookie, cursor, props.clothing_id, props.color, props.size)
        if(data?.clothing && res.status == 404) {
          setEnd(true)
          setLoad(false)
          return
        }
        if(res.status === 401) {
          await deleteCookie(props.cookieName)
          router.push("/auth/entrar")
          return
        }
        setLoad(false)
        if(data?.clothing && res.clothing) {
          data.clothing.push(...res.clothing)
          setData({
            clothing: data.clothing,
            status: 200
          })
        } else {
          setData(res)
        }
        setRequests((r) => r++)
        setLoad(false)
        if((props.page == undefined && res.status == 200) && res.clothing) {
          setTotalPrice(res.clothing[0].preco)
          setData({
            clothing: [
              res.clothing[0]
            ],
            status: res.status
          })
        } else {
          let totalPrice = 0
          res.clothing?.map(({preco,quantidade}) => {
            totalPrice += preco*quantidade
          })
          setTotalPrice((t) => totalPrice+t)
        }
      }())
    }
  },[data])

  return (
    <>
      {load && <SpinLoading />}
      {popupError && <PopupError handleOut={(() => setPopupError(false))} />}
      <main className={`${styles.main} ${load && styles.opacity}`}>
        {(data?.status == 200 && data.clothing) ?
          <>
            <CalcFreightForm setFreight={setFreight} load={load} setLoad={setLoad} end={end} clothing={data.clothing} setDelivery={setDelivery} delivery={delivery} />
            <Payment setBoleto={setBoleto} paymentType={paymentType} setPaymentType={setPaymentType} boleto={boleto} setCard={setCard} card={card} load={load} setLoad={setLoad} setError={setPopupError} cookieName={props.cookieName} cookieVal={props.cookieVal} />
            <Address setAddress={setAddress} address={address}/>
            <Products freight={freight} clothing={data.clothing} totalPrice={formatPrice(totalPrice)} />
            <button className={styles.button}>Finalizar compra</button>
          </>
        : <span>.</span>}
        {data?.status == 500 &&
          <p className={styles.p}>Parece que houve um erro! Tente recarregar a página</p>
        }
           {data?.status == 404 && 
            <>
              <p className={styles.p} style={{marginTop: "25px"}}>Nenhum produto foi encontrado</p>
              <Link style={{marginLeft: "10px"}} href="/" className={styles.seeClothing}>Ver roupas</Link>
            </>
          }
      </main>
    </>
  )
}