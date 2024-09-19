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
import { boleto, card, clothing, enderecoContato, responseErrorsPayOrder, responseErrorsPayOrderType } from '@/api/clothing/payOrderInterfaces'
import PayOrder from '@/api/clothing/payOrder'
import CalcFreight from '@/api/clothing/calcFreight'
import RetryPayment from '@/api/clothing/retryPayment'
import GetOrderDetail, { getOrderDetailResponse } from '@/api/clothing/getOrderDetail'
import Menu from '../menu/menu'
import GetUser from '@/api/user/getUser'
import RecaptchaForm from '@/funcs/recaptchaForm'
import { env } from '@/api/path'
import { regions } from './regionCode'

interface props {
  cookieName?: string
  cookieVal?: string
  page?: number
  clothing_id?: string
  color?: string
  size?: string
  retryPaymentId: string | null
  paymentTypeRetryPayment: string | null
}

export default function FinishPurchaseForm({...props}: props) {
  const router = useRouter()

  const [delivery, setDelivery] = useState<"E" | "X" | "R">("E")
  const [data, setData] = useState<getClothingCartResponse | null>(null)
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
  const [addressStatus, setAddressStatus] = useState<500 | null>(null)

  const [retryPaymentData, setRetryPaymentData] = useState<getOrderDetailResponse | null>(null)
  const [paymentTypeRetryPayment, setPaymentTypeRetryPayment] = useState<string | null>(null)
  const [retryPaymentId, setRetryPaymentId] = useState<string | null>(null)
  
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)

  const [privacy, setPrivacy] = useState<boolean>(false)
  const [privacyError, setPrivacyError] = useState<string | null>(null)

  const [responseError3ds, setResponseError3ds] = useState<string | null>(null)
  const [idTo3ds,setIdTo3ds] = useState<string | null>(null)

  const addressRef = useRef<HTMLElement | null>(null)
  const paymentRef = useRef<HTMLElement | null>(null)

  const [payment, setPayment] = useState<boolean>(true)
  const [addressForm, setAddressForm] = useState<boolean>(true)
  
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
        const res = await GetUser(cookie)
        if(res.status == 404 || res.status == 401) {
          await deleteCookie(props.cookieName)
          router.push("/auth/entrar")
          return
        }
        if(res.status == 500) {
          setData({
            clothing: null,
            status: 500
          })
          setLoad(false)
          return
        }
        if(!res.data?.verificado) {
          router.push("/auth/validar-contato")
          return
        }

        if(props.retryPaymentId == undefined || (props.paymentTypeRetryPayment != "CARTAO_CREDITO" && props.paymentTypeRetryPayment != "CARTAO_DEBITO" && props.paymentTypeRetryPayment != "BOLETO" && props.paymentTypeRetryPayment != "PIX")) {
          if((props.clothing_id == undefined || props.color == undefined || props.size == undefined) && props.page != undefined && isNaN(props.page)) {
            setEnd(true)
            setLoad(false)
            setData({
              clothing: null,
              status: 404
            })
            return
          }
          let cursor: string | undefined
          
          if(data?.clothing) {
            const lastIndex = data.clothing.length
            if(lastIndex && lastIndex - 1 >= 0 && data.clothing) {
              cursor = data.clothing[lastIndex - 1].criado_em
            }
          }
          
          const res = await GetClothingCart(cookie, cursor, props.clothing_id, props.color, props.size)
          
          setRequests((r) => r+=1)
          
          
          if(res.status == 404) {
            setEnd(true)
            setLoad(false)
            setData({
              clothing: null,
              status: 404
            })
            return
          }
          if(res.status === 401) {
            await deleteCookie(props.cookieName)
            router.push("/auth/entrar")
            return
          }
          
          if((props.page == undefined && res.status == 200) && res.clothing) {
            setTotalPrice(res.clothing[0].preco * res.clothing[0].quantidade)
            setData({
              clothing: [
                res.clothing[0]
              ],
              status: res.status
            })
            setEnd(true)
          } else if (res.status == 200 && res.clothing) {
            let tp = 0
            res.clothing?.map(({preco,quantidade}) => {
              tp += preco*quantidade
            })
            setTotalPrice((t) => totalPrice == 0 ? tp : tp+t)
            if(data?.clothing && res.clothing) {
              data.clothing.push(...res.clothing)
              setData({
                clothing: data.clothing,
                status: 200
              })
            } else {
              setData(res)
            }
          }
          setLoad(false)
          } else {
            setEnd(true)
            let paymentType: string = ""
            if(props.paymentTypeRetryPayment == "CARTAO_CREDITO" || props.paymentTypeRetryPayment == "CARTAO_DEBITO") {
              paymentType = "CARTAO"
            } else {
              paymentType = props.paymentTypeRetryPayment
            }
            
            const id = "ORDE_"+props.retryPaymentId
            
            setPaymentTypeRetryPayment(props.paymentTypeRetryPayment)
            setRetryPaymentId(id)
            const res = await GetOrderDetail(cookie, id, paymentType)
            
            if(res.status == 200 && res.data && typeof res.data == "object") {
              if(res.data.informacoesPagamento.mensagem == "SUCESSO") {
                router.push("/usuario/meus-pedidos")
                return
              }
              setAddress({
                bairro: res.data.pedido.bairro,
                cidade: res.data.pedido.cidade,
                complemento: res.data.pedido.complemento,
                email: res.data.pedido.email,
                numeroResidencia: res.data.pedido.numeroResidencia,
                rua: res.data.pedido.rua,
                servico: res.data.pedido.servico,
                cep: res.data.pedido.cep,
                nome: res.data.pedido.nome,
                tax_id: res.data.pedido.cpfCnpj,
                telefone: {
                  DDD: res.data.pedido.telefone.substring(2,4),
                  DDI: "55",
                  Numero: res.data.pedido.telefone.substring(4)
                },
                codigoRegiao: res.data.pedido.regiao, 
                regiao: regions[res.data.pedido.regiao as keyof typeof regions],
              })
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

  useEffect(() => {
    if(props.page && !isNaN(props.page) && requests > Number(props.page)) {
      setEnd(true)
    }
  }, [requests])

  async function calcFreight(): Promise<number | null> {
    if(data && data.clothing && address) {
      const clothingIds: string[] = []
      const productQuantity: number[] = []
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

  async function handle3DS(totalPrice: number): Promise<string | null> {
    if (!address || !paymentType || !card) return null
    if (!address) return null
    const request = {
      data: {
        amount: {
          value: totalPrice,
          currency: "BRL"
        },
        customer: {
          name: address.nome,
          email: address.email,
          phones: [{
            area: Number(address.telefone.DDD),
            country: Number(address.telefone.DDI),
            number: Number(address.telefone.Numero),
            type: "MOBILE"
          }]
        },
        paymentMethod: {
          installments: card.parcelas,
          type: paymentType.toUpperCase(),
          card: {
            expMonth: Number(card.expMes),
            expYear: Number(card.expAno),
            holder: {
              name: card.nome
            },
            number: Number(card.numeroCartao),
          }
        },
        shippingAddress: {
          city: address.cidade,
          complement: address.complemento,
          country: "BRA",
          number: Number(address.numeroResidencia),
          postalCode: address.cep,
          regionCode: address.codigoRegiao,
          street: address.rua
        },
        dataOnly: false
      }
    }
    /*@ts-ignore*/ 
    PagSeguro.setUp({
      session: idTo3ds,
      env: env
    })
    let id: string = ""
   /*@ts-ignore*/ 
    await PagSeguro.authenticate3DS(request).then( result => {
      if(result.status == "CHANGE_PAYMENT_METHOD") {
        setResponseError3ds("autenticação 3DS negada pelo pagbank,escolha outro meio de pagamento")
      }
      if(result.status == "AUTH_NOT_SUPPORTED") {
        setResponseError3ds("autenticação 3DS indisponível para este cartão,escolha outro meio de pagamento")
      }
      if(result.status == "AUTH_FLOW_COMPLETED") {
        id = result.id
      }
        /*@ts-ignore*/ 
      if(this) {
        /*@ts-ignore*/ 
      if("logResponseToScreen" in this) {
        /*@ts-ignore*/ 
        this.logResponseToScreen(result)
      }
      /*@ts-ignore*/ 
      if("stopLoading" in this) {
        /*@ts-ignore*/ 
        this.stopLoading()
      }
      }
      /*@ts-ignore*/ 
    }).catch((err) => {
      setLoad(false)
      /*@ts-ignore*/ 
      if(err instanceof PagSeguro.PagSeguroError ) {
        setPopupError(true)
        console.log(err);
        console.log(err.detail);
        /*@ts-ignore*/ 
        if(this) {
              /*@ts-ignore*/ 
          if("stopLoading" in this) {
            /*@ts-ignore*/ 
            this.stopLoading()
          }
        }
        }
    })
    return id == "" ? null : id
  }
  
  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setPrivacyError(null)
    setRecaptchaError(null)
    setResponseError(null)
    setPopupError(false)
    setResponsePaymentError(null)
    setResponseError3ds(null)
    if(paymentType == null || (card == null && boleto == null && paymentType != "pix")) {
      if(paymentRef.current instanceof HTMLElement) {
        !payment && setPayment(true)
        paymentRef.current.scrollIntoView({behavior:"smooth",block:"center"})
        return
      }
    }
    if(address == null) {
      if(addressRef.current instanceof HTMLElement) {
        !address && setAddressForm(true)
        addressRef.current.scrollIntoView({behavior:"smooth",block:"center"})
        return
      }
    }
    const token = RecaptchaForm(setRecaptchaError)
    if(token == "") {
      return
    }
    if(!privacy) {
      setPrivacyError("é necessário aceitar a política de privacidade")
      return
    }
    const cookie = props.cookieName+"="+props.cookieVal
    if(!retryPaymentData && !retryPaymentId) {
      const clothing: clothing[] = []
      data?.clothing && data.clothing.map((infos) => {
        if(!infos.excedeEstoque || infos.disponivel) {
          clothing.push({
            cor: infos.cor,
            quantidade: infos.quantidade,
            roupaId: infos.roupa_id,
            tamanho: infos.tamanho,
            preco: infos.preco
          })
        }
      })
      if(address != null && paymentType != null && data && data.clothing) {
        setLoad(true)
        let vlrFrete = await calcFreight()
        if(vlrFrete == null) {
          return
        }
        if(totalPrice >= 200) {
          vlrFrete = 0
        }
        const newCard = card
        const tp = Math.round((totalPrice+vlrFrete)*100) / 100
        if (paymentType == "debit_card") {
          const id = await handle3DS(Math.round(tp * 100))
          if(typeof id != "string" || id == "") {
            setLoad(false)
            return
          }
          if(newCard) {
            newCard.id3DS = id
          }
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
          precoTotal: tp,
          regiao: address.regiao,
          rua: address.rua,
          servico: address.servico,
          boleto: boleto,
          cartao: newCard,
          roupa: clothing,
          telefone: address.telefone,
          tipoPagamento: paymentType == "debit_card" ? "CARTAO_DEBITO" : paymentType == "credit_card" ? "CARTAO_CREDITO" : paymentType == "boleto" ? "BOLETO" : "PIX",
          token: token
        })

        if (typeof res == "string" && res == "recaptcha inválido") {
          setRecaptchaError(res)
          //@ts-ignore
          window.grecaptcha.reset()
        }
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
          setResponseError("parece que uma das suas roupas está indisponível, volte a sua bolsa e exclua ou altere esta roupa")
        } else if (res ==  "peso maxímo atingido") {
          setResponseError("tente deletar alguns items do carrinho pois o peso excede o peso máximo de entrega")
        } else if (res == "cep de destino inválido") {
          setResponseError(res)
        } else if (res == "frete não disponível") {
          setResponseError(res)
        } else if (res == "preço calculado não é igual ao esperado" || res == "não foi possivel salvar o pedido") {
          setPopupError(true)
          if(res == "preço calculado não é igual ao esperado") {
            setResponseError("parece que houve uma alteração nos preços,recarregue a página e tente novamente")
            setEnd(false)
          }
        } else {
          if(typeof res == "string" && res.includes("order_id:")) {
            const startIndex = res.indexOf('order_id:')
            const start = startIndex + 'order_id:'.length
            const orderId = res.substring(start)
            const beforeOrderId = res.substring(0, startIndex).trim().replace(",","")
            let pt: string
            if(paymentType == "credit_card") {
              pt = "CARTAO_CREDITO"
            } else if (paymentType == "debit_card"){
              pt = "CARTAO_DEBITO"
            } else {
              pt = paymentType.toUpperCase()
            }
            window.history.pushState({}, "", "?retry_payment_id="+orderId.substring(5)+"&paymentType="+pt)
            console.log(orderId);
            
            setPaymentTypeRetryPayment(pt)
            setRetryPaymentId(orderId)
            setResponseError(beforeOrderId)
          }
          const quantityErrorPattern = /a quantidade do pedido \d+ excede o estoque/
          if (typeof res == "string" && (responseErrorsPayOrder.includes(res as responseErrorsPayOrderType) || quantityErrorPattern.test(res))) {
            setResponseError(res)
          }
        }
        setLoad(false)
      }
    } else if (paymentTypeRetryPayment && retryPaymentId && paymentType) {
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
      let tp:number = 0
      const clothing: clothing[] = []
      if(retryPaymentData && typeof retryPaymentData.data == "object" && retryPaymentData.data) {
        retryPaymentData.data.pedido.pacotes.map(({...packages}) => {
          packages.roupa.map(({...infos}) => {
            clothing.push({
              cor: infos.cor,
              quantidade: Number(infos.quantidade),
              roupaId: infos.id,
              tamanho: infos.tamanho.toLocaleLowerCase(),
              preco: infos.preco
            })
          })
        })
        tp = retryPaymentData.data.pedido.precoTotal
      } else if (data?.clothing) {
        let vlrFrete = await calcFreight()
        if(vlrFrete == null) {
          return
        }
        if(totalPrice >= 200) {
          vlrFrete = 0
        }
        data.clothing.map(({...c}) => {
          clothing.push({
            cor: c.cor,
            quantidade: Number(c.quantidade),
            roupaId: c.roupa_id,
            tamanho: c.tamanho.toLocaleLowerCase(),
            preco: c.preco,
          })
        })
        tp = Math.round((totalPrice+vlrFrete)*100) / 100
      }
      let newPayment: string = "" 
      let payment: string
      if(paymentType == "credit_card") {
        payment = "CARTAO_CREDITO"
      } else if (paymentType == "debit_card") {
        payment = "CARTAO_DEBITO"
      } else {
        payment = paymentType.toUpperCase()
      }

      if(paymentTypeRetryPayment != payment) {
        newPayment = payment
      }
      const newCard = card
      if (paymentType == "debit_card") {
        const id = await handle3DS(Math.round(tp * 100))
        if(typeof id != "string" || id == "") {
          setLoad(false)
          return
        }
        if(newCard) {
          newCard.id3DS = id
        }
      }
      console.log(retryPaymentId);
      
      const res = await RetryPayment(cookie, {
        novoTipoPagamento: newPayment,
        boleto: boleto,
        cartao: newCard,
        pedido_id: retryPaymentId,
        precoTotal: tp,
        roupa: clothing,
        tipoPagamento: paymentTypeRetryPayment,
        token: token
      })
      
      if(typeof res == "object" && 'pedido_id' in res) {
        router.push("/usuario/meus-pedidos")
        return
      }
      if (typeof res == "string" && res == "recaptcha inválido") {
        setRecaptchaError(res)
        //@ts-ignore
        window.grecaptcha.reset()
      }
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
      if(res == "novo tipo de pagamento não pode ser pix" || res == "não foi possível salvar o pedido" || res == "não é possível pagar um pedido cancelado com pix" || res == 500) {
        setPopupError(true)
      } else if (res == "ocorreu uma alteração nos preços das roupas" || res == "preço calculado não é igual ao esperado") {
        setResponseError("não é possivel tentar pagar novamente, o preço foi alterado")
      } else if (res == "cep de destino inválido") {
        setResponseError(res)
      } else if (res == "peso máximo atingido") {
        setResponseError("não é possível tentar pagar novamente, o peso excede o máximo de entrega")
      } else if (res == "a quantidade do pedido excede o estoque") {
        setResponseError("não é possível tentar pagar novamente, o estoque não é suficiente")
      } else if (res == "pedido está sendo processado" || res == "pedido já está pago" || res == "erro ao deletar carrinho") {
        router.push("/usuario/meus-pedidos")
        return
      } else {
        if(typeof res == "string" && res.includes("order_id:")) {
          const startIndex = res.indexOf('order_id:')
          const beforeOrderId = res.substring(0, startIndex).trim().replace(",","")
          setResponseError(beforeOrderId)
        }
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
      <header>
        <Menu cookieName={props.cookieName} cookieVal={props.cookieVal}/>
      </header>
      {load && <SpinLoading />}
      {popupError && <PopupError handleOut={(() => setPopupError(false))} />}
      <main className={`${styles.main} ${load && `${styles.opacity}`} ${(data?.status == 500 || data?.status == 404 || retryPaymentData?.status == 404 || retryPaymentData?.status == 500 || addressStatus == 500) && styles.mainHeight}`}>
        <div className={styles.container}>
          {(((data?.status == 200 || (retryPaymentData == null && data == null)) || (retryPaymentData?.status == 200 || (retryPaymentData == null && data == null))) && addressStatus != 500) && <h1 className={styles.title}>Finalizar compra</h1>}
          {((data?.status == 200 && data.clothing) || (retryPaymentData?.status == 200 && paymentTypeRetryPayment)) && addressStatus != 500 ?
            <>
              {(!retryPaymentData?.data && !retryPaymentId) && <CalcFreightForm popupError={popupError} setPopupError={setPopupError} totalPrice={totalPrice} setFreight={setFreight} load={load} setLoad={setLoad} end={end} clothing={data?.clothing} setDelivery={setDelivery} delivery={delivery} />}
              <p className={`${styles.price} ${styles.totalPrice}`}>Preço: R${formatPrice(totalPrice)}</p>
              {totalPrice >= 200 ? <p style={{marginBottom: "10px"}} className={styles.price}>Frete grátis</p> : !totalPriceWithFreight ? <p style={{marginBottom: "10px"}} className={styles.price}>Digite seu cep acima para visualizar seu preço juntamente com o frete</p> : 
                <>
                  <p style={{marginBottom: "10px"}} className={styles.price}>Total: R${totalPriceWithFreight}</p>
                </>
              }
              <Payment payment={payment} setPayment={setPayment} price={Math.round((totalPrice) * 100)/100} responseError3ds={responseError3ds} setIdTo3ds={setIdTo3ds} addressRef={addressRef} address={address} retryPayment={paymentTypeRetryPayment} paymentRef={paymentRef} responseError={responsePaymentError} setBoleto={setBoleto} paymentType={paymentType} setPaymentType={setPaymentType} boleto={boleto} setCard={setCard} card={card} load={load} setLoad={setLoad} setError={setPopupError} cookieName={props.cookieName} cookieVal={props.cookieVal} />
              {(!paymentTypeRetryPayment || paymentTypeRetryPayment == "BOLETO") && <Address addressForm={addressForm} setAddressForm={setAddressForm} setAdressStatus={setAddressStatus} setLoad={setLoad} cookieName={props.cookieName} cookieVal={props.cookieName} addressRef={addressRef} setAddress={setAddress} address={address}/>}
              <form onSubmit={handleSubmit}>
                <Products privacyError={privacyError} setPrivacy={setPrivacy} recaptchaError={recaptchaError} setTotalPriceWithFreight={setTotalPriceWithFreight} totalPriceWithFreight={totalPriceWithFreight} retryPaymentData={retryPaymentData} responseError={responseError} freight={freight} clothing={data?.clothing} totalPrice={(formatPrice(Math.round((totalPrice) * 100)/100))} />
              </form> 
            </>
          : load && <p className={styles.load}>carregando...</p>}
          {(data?.status == 500 || retryPaymentData?.status == 500 || addressStatus == 500) &&
            <p className={styles.serverError}>Parece que houve um erro! Tente recarregar a página</p>
          }
          {((data?.status == 404 || retryPaymentData?.status == 404) && addressStatus != 500) && 
          <div>
            <p className={styles.notFound} style={{marginTop: "25px"}}>{"Pedido não encontrado"}</p>
            <Link style={{marginLeft: "10px"}} href={`${paymentTypeRetryPayment && retryPaymentId ? "/usuario/minha-bolsa" : "/"}`}className={styles.seeClothing}>{paymentTypeRetryPayment && retryPaymentId ? "Ver carrinho" : "Ver roupas"}</Link>
          </div>
          }
        </div>
      </main>
    </>
  )
}