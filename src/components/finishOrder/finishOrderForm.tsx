'use client'

import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import styles from './finishOrderForm.module.css'
import GetClothingCart, { dataGetClothingCart, getClothingCartResponse } from '@/api/clothing/getClothingCart'
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
import { boleto, card, clothing, enderecoContato, responseErrorsPayOrder, responseErrorsPayOrderType } from '@/api/clothing/payOrderInterfaces'
import PayOrder from '@/api/clothing/payOrder'
import CalcFreight from '@/api/clothing/calcFreight'
import RetryPayment from '@/api/clothing/retryPayment'
import GetOrderDetail, { getOrderDetailResponse } from '@/api/clothing/getOrderDetail'

interface props {
  cookieName?: string
  cookieVal?: string
  page?: number
  clothing_id?: string
  color?: string
  size?: string
  retryPayment?: string
  paymentType?: string
}

export default function FinishPurchaseForm({...props}: props) {
  const router = useRouter()

  const [delivery, setDelivery] = useState<"E" | "X" | "R">("E")
  const [data, setData] = useState<getClothingCartResponse | null>(null)
  const [retryPaymentData, setRetryPaymentData] = useState<getOrderDetailResponse | null>(null)
  const [popupError, setPopupError] = useState<boolean>(false)
  const [load, setLoad] = useState<boolean>(true)
  const [requests, setRequests] = useState<number>(0)
  const [end, setEnd] = useState<boolean>(false)

  const [totalPriceWithFreight, setTotalPriceWithFreight] = useState<string | null>(null)
  const [freight, setFreight] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<"card" | "credit_card" | "debit_card" | "pix" | "boleto" | null>(null)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [card, setCard] = useState<card | null>(null)
  const [boleto, setBoleto] = useState<boleto | null>(null)
  const [address, setAddress] = useState<enderecoContato | null>(null)
  const [responsePaymentError, setResponsePaymentError] = useState<string | null>(null)
  const [responseError, setResponseError] = useState<string | null>(null)
  const [retryPayment,setRetryPayment] = useState<string | null>(null)
  const [addressStatus, setAddressStatus] = useState<500 | null>(null)

  const [paymentTypeRetryPayment, setPaymentTypeRetryPayment] = useState<string | null>(null)

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
        
        if(props.retryPayment == undefined || (props.paymentType != "CARTAO_CREDITO" && props.paymentType != "CARTAO_DEBITO" && props.paymentType != "BOLETO" && props.paymentType != "PIX")) {   
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
          setLoad(false)
          } else {
            setEnd(true)
            setRetryPayment(props.paymentType)
            let paymentType: string = ""
            if(props.paymentType == "CARTAO_CREDITO" || props.paymentType == "CARTAO_DEBITO") {
              paymentType = "CARTAO"
            } else {
              paymentType = props.paymentType
            }
            
            const id = "ORDE_"+props.retryPayment

            const res = await GetOrderDetail(cookie, id, paymentType)
            
            if(res.status == 200 && res.data && typeof res.data == "object") {
              if(res.data.informacoesPagamento.mensagem == "SUCESSO") {
                router.push("/usuario/meus-pedidos")
                return
              }
              setPaymentTypeRetryPayment(props.paymentType)
            }
            if(typeof res.status == "number" && res.status == 404) {
              setRetryPaymentData({
                data: null,
                status: 404
              })
              setLoad(false)
              return
            }
            if(typeof res.status == "number" && res.status == 500 || !res.data) {
              setRetryPaymentData({
                data: null,
                status: 500
              })
              setLoad(false)
              return
            }
            if(typeof res.data == "string" && res.data == "cookie inválido") {
              await deleteCookie(props.cookieName)
              router.push("/auth/entrar")
              return null
            }
            if(typeof res.data == "string" && res.data == "contato não verificado") {
              router.push("/auth/validar-contato")
              return null
            }

            setRetryPaymentData({
              data: res.data,
              status: 200
            })
            let tpwf = res.data.pedido.precoTotal.toString()
            if(tpwf.includes(".")) {
              tpwf = tpwf.replace(".",",")
            }
            setTotalPrice(Math.round((Math.abs(res.data.pedido.precoTotal-res.data.pedido.frete))*100) / 100)
            setTotalPriceWithFreight(tpwf)
            setLoad(false)
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
    event.preventDefault()
    setResponseError(null)
    setPopupError(false)
    setResponsePaymentError(null)
    const cookie = props.cookieName+"="+props.cookieVal
    
    if(!retryPayment) {
    const clothing: clothing[] = []
    data?.clothing && data.clothing.map((infos) => {
      if(!infos.excedeEstoque || infos.disponivel) {
        clothing.push({
          cor: infos.cor,
          quantidade: infos.quantidade,
          roupaId: infos.roupa_id,
          tamanho: infos.tamanho,
        })
      }
    })
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
      if(address != null && paymentType != null && data && data.clothing) {
        setLoad(true)
        let vlrFrete = await calcFreight()
        if(vlrFrete == null) {
          return
        }
        if(totalPrice >= 200) {
          vlrFrete = 0
        }
        const res = await PayOrder(cookie, {
          bairro: address.bairro,
          cep: address.cep,
          cidade: address.cidade,
          codigoRegiao: address.codigoRegiao,
          complemento: address.complemento,
          tax_id: address.tax_id,
          email: address.email,
          nome: address.nome,
          numeroResidencia: address.numeroResidencia,
          precoTotal: Math.round((totalPrice+vlrFrete)*100) / 100,
          regiao: address.regiao,
          rua: address.rua,
          servico: address.servico,
          boleto: boleto,
          cartao: card,
          roupa: clothing,
          telefone: address.telefone,
          tipoPagamento: paymentType == "debit_card" ? "CARTAO_DEBITO" : paymentType == "credit_card" ? "CARTAO_CREDITO" : paymentType == "boleto" ? "BOLETO" : "PIX"
        })
        
        if(props.cookieName == undefined || props.cookieVal == undefined) {
          router.push("/auth/entrar")
          return
        }
        if(typeof res == "object" && 'pedido_id' in res) {
          router.push("/usuario/meus-pedidos")
          return
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
        if(res == "roupa não encontrada" || res == "a quantidade do pedido excede o estoque") {
          setResponseError("parece que uma das suas roupas está indisponível, tente novamente, esta roupa não será incluida no pedido")
          setEnd(false)
        } else if (res ==  "peso maxímo atingido") {
          setResponseError("tente deletar alguns items do carrinho pois o peso excede o peso máximo de entrega")
        } else if (res == "cep de destino inválido") {
          setResponseError(res)
        } else if (res == "frete não disponível") {
          setResponseError(res)
        } else if (res == "preço calculado não é igual ao esperado" || res == "não foi possivel salvar o pedido") {
          setPopupError(true)
        } else {
          const quantityErrorPattern = /a quantidade do pedido \d+ excede o estoque/
          if (typeof res == "string" && (responseErrorsPayOrder.includes(res as responseErrorsPayOrderType) || quantityErrorPattern.test(res) || res == "não foi possível pagar o pedido")) {
            setResponseError(res)
          }
        }
        setLoad(false)
      }
    } else if (paymentTypeRetryPayment && props.paymentType && props.retryPayment && paymentType && retryPaymentData && typeof retryPaymentData.data == "object" && retryPaymentData.data) {
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
      setLoad(true)
      const clothing: clothing[] = []
      retryPaymentData?.data?.pedido.roupa.map((infos) => {
        clothing.push({
          cor: infos.cor,
          quantidade: Number(infos.quantidade),
          roupaId: infos.id,
          tamanho: infos.tamanho.toLocaleLowerCase(),
        })
      })
      let newPayment: string = "" 
      let payment: string
      if(paymentType == "credit_card") {
        payment = "CARTAO_CREDITO"
      } else if (paymentType == "debit_card") {
        payment = "CARTAO_DEBITO"
      } else {
        payment = paymentType.toUpperCase()
      }

      if(props.paymentType != payment) {
        newPayment = payment
      }
      
      const res = await RetryPayment(cookie, {
        novoTipoPagamento: newPayment,
        boleto: boleto,
        cartao: card,
        pedido_id: "ORDE_"+props.retryPayment,
        precoTotal: retryPaymentData.data.pedido.precoTotal,
        roupa: clothing,
        tipoPagamento: props.paymentType
      })
      
      if(props.cookieName == undefined || props.cookieVal == undefined) {
        router.push("/auth/entrar")
        return
      }
      if(typeof res == "string" && res == "cookie inválido") {
        await deleteCookie(props.cookieName)
        router.push("/auth/entrar")
        return null
      }
      if(typeof res == "string" && res == "contato não verificado") {
        router.push("/auth/validar-contato")
        return null
      }
      
      if(res == "novo tipo de pagamento não pode ser pix" || res == "não foi possível salvar o pedido" || res == "não foi possível pagar o pedido" || res == "não é possível pagar um pedido cancelado com pix" || res == 500) {
        setPopupError(true)
      } else if (res == "ocorreu uma alteração nos preços das roupas" || res == "preço calculado não é igual ao esperado") {
        setResponseError("não é possivel tentar pagar novamente, o preço foi alterado")
      } else if (res == "cep de destino inválido") {
        setResponseError(res)
      } else if (res == "peso máximo atingido") {
        setResponseError("não é possível tentar pagar novamente, o peso excede o máximo de entrega")
      } else if (res == "a quantidade do pedido excede o estoque") {
        setResponseError("não é possível tentar pagar novamente, o estoque não é suficiente")
      } else if (res == "pedido está sendo processado" || res == "pedido já está pago" || res == "erro ao deletar carrinho" || res == "erro ao pagar pedido. não autorizado pelo pagseguro") {
        router.push("/usuario/meus-pedidos")
        return
      } else {
        const quantityErrorPattern = /a quantidade do pedido \d+ excede o estoque/
        if (typeof res == "string" && (responseErrorsPayOrder.includes(res as responseErrorsPayOrderType) || quantityErrorPattern.test(res))) {
          setResponseError(res)
        }
      }
      if(typeof res == "object" && "pedido_id" in res) {
        router.push("/usuarios/meus-pedidos")
        return
      }
    
      setLoad(false)
    }
  }

  return (
    <>
      {load && <SpinLoading />}
      {popupError && <PopupError handleOut={(() => setPopupError(false))} />}
      <main className={`${styles.main} ${load && `${styles.opacity}`} ${(data?.status == 500 || data?.status == 404 || retryPaymentData?.status == 404 || retryPaymentData?.status == 500 || addressStatus == 500) && styles.mainHeight}`}>
        {(((data?.status == 200 || (retryPaymentData == null && data == null)) || (retryPaymentData?.status == 200 || (retryPaymentData == null && data == null))) && addressStatus != 500) && <h1 className={styles.title}>Finalizar compra</h1>}
        {((data?.status == 200 && data.clothing) || (retryPaymentData?.status == 200 && retryPayment)) && addressStatus != 500 ?
          <>
            {!retryPaymentData?.data && <CalcFreightForm clothingRetryPayment={retryPaymentData} totalPrice={totalPrice} setFreight={setFreight} load={load} setLoad={setLoad} end={end} clothing={data?.clothing} setDelivery={setDelivery} delivery={delivery} />}
            <Payment retryPayment={paymentTypeRetryPayment} paymentRef={paymentRef} responseError={responsePaymentError} setBoleto={setBoleto} paymentType={paymentType} setPaymentType={setPaymentType} boleto={boleto} setCard={setCard} card={card} load={load} setLoad={setLoad} setError={setPopupError} cookieName={props.cookieName} cookieVal={props.cookieVal} />
            {(!retryPayment || props.paymentType == "BOLETO") && <Address setAdressStatus={setAddressStatus} setLoad={setLoad} cookieName={props.cookieName} cookieVal={props.cookieName} addressRef={addressRef} setAddress={setAddress} address={address}/>}
            <form onSubmit={handleSubmit}>
              <Products setTotalPriceWithFreight={setTotalPriceWithFreight} totalPriceWithFreight={totalPriceWithFreight} retryPaymentData={retryPaymentData} responseError={responseError} freight={freight} clothing={data?.clothing} totalPrice={formatPrice(totalPrice)} />
            </form> 
          </>
        : load && <p className={styles.load}>carregando...</p>}
        {(data?.status == 500 || retryPaymentData?.status == 500 || addressStatus == 500) &&
          <p className={styles.serverError}>Parece que houve um erro! Tente recarregar a página</p>
        }
        {((data?.status == 404 || retryPaymentData?.status == 404) && addressStatus != 500) && 
        <div>
          <p className={styles.notFound} style={{marginTop: "25px"}}>{props.paymentType && props.retryPayment ? "pedido não encontrado" : "Nenhum pedido foi encontrado"}</p>
          <Link style={{marginLeft: "10px"}} href={`${props.paymentType && props.retryPayment ? "/usuario/minha-bolsa" : "/"}`}className={styles.seeClothing}>{props.paymentType && props.retryPayment ? "Ver carrinho" : "Ver roupas"}</Link>
        </div>
        }
      </main>
    </>
  )
}