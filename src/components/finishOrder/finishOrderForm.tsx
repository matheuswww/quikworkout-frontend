'use client'

import { SyntheticEvent, useEffect, useRef, useState } from 'react'
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
import { boleto, card, enderecoContato, responseErrorsPayOrder, responseErrorsPayOrderType } from '@/api/clothing/payOrderInterfaces'
import PayOrder from '@/api/clothing/payOrder'
import CalcFreight from '@/api/clothing/calcFreight'

interface props {
  cookieName?: string
  cookieVal?: string
  page?: number
  clothing_id?: string
  color?: string
  size?: string
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
  const [paymentType, setPaymentType] = useState<"card" | "credit_card" | "debit_card" | "pix" | "boleto" | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [card, setCard] = useState<card | null>(null)
  const [boleto, setBoleto] = useState<boleto | null>(null)
  const [address, setAddress] = useState<enderecoContato | null>(null)
  const [responsePaymentError, setResponsePaymentError] = useState<string | null>(null)
  const [responseError, setResponseError] = useState<string | null>(null)

  const addressRef = useRef<HTMLElement | null>(null)
  const paymentRef = useRef<HTMLElement | null>(null)
  
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
          setTotalPrice(res.clothing[0].preco * res.clothing[0].quantidade)
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
  
  async function calcFreight(): Promise<number | null> {
    if(data && data.clothing && address) {
      let clothingIds: string[] = []
      let productQuantity: number[] = []
      data.clothing.map(({roupa_id,quantidade}) => {
        clothingIds.push(roupa_id)
        productQuantity.push(quantidade)
      })
      const res = await CalcFreight({
        cep: address.cep,
        quantidadeProduto: productQuantity,
        roupa: clothingIds,
        servico: delivery
      })
      if(res.status == 500) {
        setPopupError(true)
      }
      if(res.data == "cep de destino inválido") {
        setResponseError(res.data)
      }
      if(res.data == "frete não disponível") {
        setResponseError("frete não disponível para este endereço e tipo de entrega")
      }
      if(res.data == "peso maxímo atingido") {
        setResponseError("tente deletar alguns items do carrinho pois o peso excede o peso máximo de entrega")
      }
      if(res.data == "roupa não encontrada") {
        setResponseError("parece que uma das suas roupas está indisponível, verifique sua bolsa e remova a roupa")
      }
      if(typeof res.data == "object" && res.data && 'vlrFrete' in res.data && res.data?.vlrFrete) {
        return res.data.vlrFrete
      }
      setLoad(false)
      return null
    }
    return null
  }

  async function handleSubmit(event: SyntheticEvent) {
    setResponseError(null)
    setPopupError(false)
    setResponsePaymentError(null)
    event.preventDefault()
    if(paymentType == null || (card == null && boleto == null && paymentType != "pix")) {
      if(paymentRef.current instanceof HTMLElement) {
        const button = paymentRef.current.querySelector("#submit")
        if(button instanceof HTMLButtonElement) {
          button.click()
        } else {
          paymentRef.current.scrollIntoView({behavior:"smooth",block:"center"})
        }
        return
      }
    }
    if(address == null) {
      if(addressRef.current instanceof HTMLElement) {
        const button = addressRef.current.querySelector("#submit")
        if(button instanceof HTMLButtonElement) {
          button.click()
        } else {
          addressRef.current.scrollIntoView({behavior:"smooth",block:"center"})
        }
        return
      }
    }
    const cookie = props.cookieName+"="+props.cookieVal
    if(address != null && paymentType != null && data && data.clothing) {
      setLoad(true)
      const vlrFrete = await calcFreight()
      if(vlrFrete == null) {
        return
      }
      const res = await PayOrder(cookie, {
        bairro: address.bairro,
        cep: address.cep,
        cidade: address.cidade,
        codigoRegiao: address.codigoRegiao,
        complemento: address.complemento,
        tax_id: address.cpfCnpj,
        email: address.email,
        nome: address.nome,
        numeroResidencia: address.numeroResidencia,
        precoTotal: Math.round((totalPrice+vlrFrete)*100) / 100,
        regiao: address.regiao,
        rua: address.rua,
        servico: address.servico,
        boleto: boleto,
        cartao: card,
        roupa: data.clothing.map(({roupa_id,cor,tamanho,quantidade}) => {
          return {
            roupaId: roupa_id,
            cor: cor,
            tamanho: tamanho,
            quantidade: quantidade
          }
        }),
        telefone: address.telefone,
        tipoPagamento: paymentType == "debit_card" ? "CARTAO_DEBITO" : paymentType == "credit_card" ? "CARTAO_CREDITO" : paymentType == "boleto" ? "BOLETO" : "PIX"
      })
      if(props.cookieName == undefined || props.cookieVal == undefined) {
        router.push("/auth/entrar")
        return
      }
      if(typeof res == "object" && 'pedido_id' in res) {

      }
      if(res == "cookie inválido") {
        await deleteCookie(props.cookieName)
        router.push("/auth/entrar")
        return
      }
      if(res == "contato não verificado") {
        router.push("/auth/validar-contato")
        return
      }
      if(res == 500) {
        setPopupError(true)
      }
      if(res == "roupa não encontrada") {
        setResponseError("parece que uma das suas roupas está indisponível, verifique sua bolsa e remova a roupa")
      }
      if(res ==  "peso maxímo atingido") {
        setResponseError("tente deletar alguns items do carrinho pois o peso excede o peso máximo de entrega")
      }
      if(res == "cep de destino inválido") {
        setResponseError(res)
      }
      if(res == "frete não disponível") {
        setResponseError(res)
      }
      if(res == "preço calculado não é igual ao esperado" || res == "não foi possivel salvar o pedido") {
        setPopupError(true)
      }
      if(res == "a quantidade do pedido excede o estoque") {
        setResponseError("parece que uma das suas roupas está indisponível, verifique sua bolsa e atualize a quantidade pedida")
      }
      const quantityErrorPattern = /a quantidade do pedido \d+ excede o estoque/
      if (typeof res == "string" && (responseErrorsPayOrder.includes(res as responseErrorsPayOrderType) || quantityErrorPattern.test(res) || res == "não foi possível pagar o pedido")) {

      }
      if(typeof res == "object" && "pedido_id" in res) {
        router.push("/usuario/meus-pedidos")
        return
      }
      setLoad(false)
    }
  }

  return (
    <>
      {load && <SpinLoading />}
      {popupError && <PopupError handleOut={(() => setPopupError(false))} />}
      <main className={`${styles.main} ${load && styles.opacity}`}>
        {(data?.status == 200 && data.clothing) ?
          <>
          <CalcFreightForm setFreight={setFreight} load={load} setLoad={setLoad} end={end} clothing={data.clothing} setDelivery={setDelivery} delivery={delivery} />
          <Payment paymentRef={paymentRef} responseError={responsePaymentError} setBoleto={setBoleto} paymentType={paymentType} setPaymentType={setPaymentType} boleto={boleto} setCard={setCard} card={card} load={load} setLoad={setLoad} setError={setPopupError} cookieName={props.cookieName} cookieVal={props.cookieVal} />
          <Address addressRef={addressRef} setAddress={setAddress} address={address}/>
          <form onSubmit={handleSubmit}>
            <Products responseError={responseError} freight={freight} clothing={data.clothing} totalPrice={formatPrice(totalPrice)} />
          </form>
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