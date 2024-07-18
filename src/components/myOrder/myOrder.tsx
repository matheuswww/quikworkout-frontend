"use client"

import { useRouter } from "next/navigation"
import { SyntheticEvent, useEffect, useState } from "react"
import styles from './myOrder.module.css'
import Expand from 'next/image'
import Link from "next/link"
import GetOrder from "@/api/clothing/getOrder"
import SpinLoading from "../spinLoading/spinLoading"
import GetOrderDetail, { getOrderDetailResponse } from "@/api/clothing/getOrderDetail"
import { deleteCookie } from "@/action/deleteCookie"
import PopupError from "../popupError/popupError"
import formatPrice from "@/funcs/formatPrice"
import QRCODE from "next/image"
import ClothingImg from "next/image"
import Menu from "../menu/menu"

interface props {
  cookieName?: string
  cookieVal?: string
}

interface payment {
  card: card | null
  boleto: boleto | null
  pix: pix | null
}

export default function MyOrder({cookieName,cookieVal}:props) {
  const router = useRouter()
  const [status, setStaus] = useState<200 | 500 | 404 | 401 | 400 | null>(null)
  const [popupError, setPopupError] = useState<boolean>(false)
  const [load, setLoad] = useState<boolean>(true)
  const [paymentInfo, setPaymentInfo] = useState<payment[]>([])
  const [getOrder, setGetOrder] = useState<getOrder[] | null>(null)
  const [end, setEnd] = useState<boolean>(false)
  const [newPage, setNewPage] = useState<boolean>(false)
  const [newPageLoad, setNewPageLoad] = useState<boolean>(false)

  useEffect(() => {
    if(!end) {
      (async function() {
        if(cookieName == undefined || cookieVal == undefined) {
          router.push("/auth/entrar")
          return
        }
        const cookie = cookieName+"="+cookieVal
        var cursor: string | undefined
        if(getOrder) {
          setNewPageLoad(true)
          const lastIndex = getOrder.length
          if(lastIndex && lastIndex - 1 >= 0 && getOrder) {
            cursor = getOrder[lastIndex - 1].criadoEm
          }3
        }
        
        const res = await GetOrder(cookie, cursor)
    
        if(getOrder && res.status == 404) {
          setEnd(true)
          setLoad(false)
          setNewPageLoad(false)
          return
        }
  
        if(typeof res.data == "string" && res.data == "cookie inválido") {
          await deleteCookie(cookieName)
          router.push("/auth/entrar")
          return
        }
        
        if(typeof res.data == "string" && res.data == "contato não verificado") {
          router.push("/auth/validar-contato")
          return
        }
        if(res.data instanceof Array && res.status == 200) {
          let array: payment[] = []
          for(let i = 0; i <= res.data.length - 1;i++) {
            if(res.data[i].tipo_pagamento == "PIX" && !checkPix(res.data[i].criadoEm, 60*4) && res.data[i].status_pagamento != "SUCESSO") {
              const res2 = await getOrderDetail(res.data[i].tipo_pagamento, res.data[i].pedido_id)
              if(res2) {
                if(res2.data && typeof res2.data == "object" && res2.data.informacoesPagamento && 'qrcode' in res2.data.informacoesPagamento) {
                  array.push({
                    card: null,
                    boleto: null,
                    pix: res2.data.informacoesPagamento
                  })
                }
              }
            } else if (res.data[i].tipo_pagamento == "BOLETO" && res.data[i].status_pagamento != "SUCESSO") {
              const res2 = await getOrderDetail(res.data[i].tipo_pagamento, res.data[i].pedido_id)
              if(res2) {
                if(res2.data && typeof res2.data == "object" && res2.data.informacoesPagamento && 'dataVencimento' in res2.data.informacoesPagamento) {
                  array.push({
                    card: null,
                    boleto: res2.data.informacoesPagamento,
                    pix: null
                  })
                }
              }
            } else {
              array.push({
                card: null,
                boleto: null,
                pix: null
              })
            }
          }
          if(getOrder && res) {
            getOrder.push(...res.data)
            paymentInfo.push(...array)
            setGetOrder(getOrder)
            setPaymentInfo(paymentInfo)
          } else {
            setGetOrder(res.data)
            setPaymentInfo(array)
          }
        }
        setStaus(res.status)
        setNewPageLoad(false)
        setLoad(false)
      }())
    }
  }, [newPage])

  useEffect(() => {
    const final = document.querySelector("#final")
    if(final instanceof HTMLSpanElement) {
      const observer = new IntersectionObserver((entries) => {
        if(entries.some((entry) => entry.isIntersecting)) {          
          if(final.classList.contains(styles.show)) {
            setNewPage(true)
          }
        }
      })
      observer.observe(final)
      return () => observer.disconnect()
    }
  },[])

  function checkPix(dateTime: string, minutes: number): boolean {
    const startDate = new Date(dateTime.replace(" ", "T")).getMinutes()
    const currentDate = new Date().getMinutes()
    const difference =  currentDate - startDate
    return difference > minutes
  }

  function checkBoleto(dueDate: string) {
    const [year, month, day] = dueDate.split('-').map(Number)
    const dueDateObj = new Date(year, month - 1, day)
    const currentDate = new Date()
    return currentDate > dueDateObj
  }

  function handleArrowClick(index: number, type: string) {
    const arrowUp = document.querySelector("#arrowUp_"+type+"_"+index)
    const arrowDown = document.querySelector("#arrowDown_"+type+"_"+index)
    const item = document.querySelector("#item_"+type+"_"+index)

    if(arrowDown instanceof HTMLElement && arrowUp instanceof HTMLElement) {
      if(arrowDown.classList.contains(styles.displayNone)) {
        arrowDown.classList.remove(styles.displayNone)
        if(item instanceof HTMLElement) {
          item.classList.add(styles.displayNone)
        }
      } else {
        arrowDown.classList.add(styles.displayNone)
        if(item instanceof HTMLElement) {
          item.classList.remove(styles.displayNone)
        }
      }
      if(arrowUp.classList.contains(styles.displayNone)) {
        arrowUp.classList.remove(styles.displayNone)
        if(item instanceof HTMLElement) {
          item.classList.add(styles.displayNone)
        }
      } else {
        arrowUp.classList.add(styles.displayNone)
        if(item instanceof HTMLElement) {
          item.classList.remove(styles.displayNone)
        }
      }
    }
  }

  async function getOrderDetail(tipoPagamento: string, pedido_id: string): Promise<getOrderDetailResponse | null> {
    if(cookieName == undefined || cookieVal == undefined) {
      router.push("/auth/entrar")
      return null
    }
    const cookie = cookieName+"="+cookieVal
    setLoad(true)
    setPopupError(false)

    let paymentType:string = ""
    if(tipoPagamento == "CREDIT_CARD" || tipoPagamento == "DEBIT_CARD") {
      paymentType = "CARTAO"
    } else {      
      paymentType = tipoPagamento
    }
    const res = await GetOrderDetail(cookie, pedido_id, paymentType)
  
    if(res.status == 200 && typeof res.data == "object") {
      setLoad(false)
      return res
    }
    if(typeof res.status == "number" && (res.status == 404 || res.status == 500)) {
      setPopupError(true)
    }
    if(typeof res.data == "string" && res.data == "cookie inválido") {
      await deleteCookie(cookieName)
      router.push("/auth/entrar")
      return null
    }
    if(typeof res.data == "string" && res.data == "contato não verificado") {
      router.push("/auth/validar-contato")
      return null
    }

    setLoad(false)
    return null
  }

  async function handlePaymentInfoClick(index: number, type: string, pedido_id: string, tipoPagamento: string) {
    if(load) {
      return
    }    
    if((paymentInfo[index].card || paymentInfo[index].boleto || paymentInfo[index].pix )) {
      handleArrowClick(index, type) 
      return
    }
    const res = await getOrderDetail(tipoPagamento, pedido_id)

    if(res) {
      setPaymentInfo((pi) => {
        if(typeof res.data == "object" && res.data != null && pi[index]) {
          pi[index] = {
            card: 'bandeira' in res.data.informacoesPagamento ? res.data.informacoesPagamento : null,
            boleto: 'dataVencimento' in res.data.informacoesPagamento ? res.data.informacoesPagamento : null,
            pix: 'qrcode' in res.data.informacoesPagamento ? res.data.informacoesPagamento : null
          }
        }
        return pi
      })
      setTimeout(() => {
        handleArrowClick(index, type) 
      });
    }
  }

  function copyLink(event: SyntheticEvent, index: number) {
    event.preventDefault()
    const link = paymentInfo[index].pix?.link 
    if(event.target instanceof HTMLElement && link) {
      navigator.clipboard.writeText(link).then(() => window.alert("link de pagamento copiado"))
    }
  }

  return (
   <>
    <header>
      <Menu cookieName={cookieName} cookieVal={cookieVal} />
    </header>
   {popupError && <PopupError handleOut={() => setPopupError(false)} />}
   {load && <SpinLoading />}
    <main className={`${styles.main} ${load && styles.opacity}`}>
      <section className={`${styles.section} ${(status == 404 || status == 500) && styles.sectionHeight}`}>
      {(status == 200 || load) && <h1 className={styles.title}>Meus pedidos</h1>}
       {(getOrder && status == 200) ? 
        <>
        {getOrder.map((infos,i) => {
          return (
              <div className={`${styles.item}`} key={infos.pedido_id}>
                <>
                {
                  infos.motivoCancelamentoEnvio && infos.motivoCancelamentoEnvio != "" && 
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Motivo do cancelamento: </p>
                    <p>{infos.motivoCancelamentoEnvio}</p>
                  </div>
                }
                <div className={styles.values}>
                  <p>ID do pedido: </p>
                  <p>{infos.pedido_id.substring(5)}</p>
                </div>
                {paymentInfo[i] && paymentInfo[i].pix && paymentInfo[i].pix?.dataExpiracao == "expirada" && 
                  <p className={styles.alert}>Seu qr code para pagamento pix foi expirado,gere outro</p>
                }
                {infos.status_pagamento != "pago" &&
                <div className={styles.values}>
                  <p>Status do pagamento: </p>
                  <p>{infos.status_pagamento}</p>
                </div>
                }
                <div className={styles.values}>
                  <p>Preço: </p>
                  <p>{formatPrice(infos.precoTotal)}</p>
                </div>
                <div className={styles.values}>
                  <p>Frete: </p>
                  <p>{formatPrice(infos.frete)}</p>
                </div>
                {infos.status_pagamento == "pagamento não solicitado" && paymentInfo[i].pix && paymentInfo[i].pix?.qrcode && paymentInfo[i].pix?.dataExpiracao == "não expirada" &&
                  <div className={`${styles.values} ${styles.infos} ${styles.qrcode}`}>
                    <p>QR CODE para pagamento: </p>
                    <QRCODE src={paymentInfo[i].pix?.qrcode as string} alt="qr code para pagamento via pix" width={220} height={220}/>
                    <button onClick={(event: SyntheticEvent) => copyLink(event, i)} className={styles.button}>Copiar link de pagamento</button>
                  </div>
                }
                {paymentInfo[i].boleto?.pdf &&
                  <>
                    <div className={`${styles.values} ${styles.infos} ${styles.boleto}`}>
                      <p>Baixar boleto: </p>
                      <Link className={styles.link} href={paymentInfo[i].boleto?.pdf as string} target="_blank" download="boleto em pdf">baixar boleto</Link>
                    </div>
                  </>
                }
                {infos.codigo_rastreio != "" ?
                  <>
                    <div className={styles.values}>
                      <p>Código de rastreio: </p>
                      <p>{infos.codigo_rastreio}</p>
                    </div>
                    <div className={styles.values}>
                      <p>Digite seu código e acompanhe seu pedido aqui: </p>
                      <Link className={styles.link} href="https://www.kangu.com.br/rastreio" target="_blank">rastrear pedido</Link>
                    </div>
                  </>
                  : infos.status_pagamento == "pago" &&
                  <div className={styles.values}>
                    <p>Rastreio do pedido: </p>
                    <p>aguardando ser entregue a transportadora</p>
                  </div>
                }
              </>
            <div className={styles.addressInfo}>
              <button className={styles.buttonExpand} onClick={() => handleArrowClick(i, "address")}>Informações de endereço e contato</button>
              <Expand src="/img/arrowUp.png" alt="expandir informações de endereço e contato" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick(i, "address")} id={`arrowUp_address_${i}`} />
              <Expand src="/img/arrowDown.png" alt="diminuir informações de endereço e contato" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(i, "address")} id={`arrowDown_address_${i}`}/>
            </div>
            {
                <div id={`item_address_${i}`} className={`${styles.displayNone} ${styles.address}`}>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Email: </p>
                    <p>{infos.email}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Telefone: </p>
                    <p>{infos.telefone}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Serviço de entrega: </p>
                    <p>{infos.servico == "E" ? "entrega normal" : infos.servico == "X" ? "entrega expressa" : "retirar"}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Rua: </p>
                    <p>{infos.rua}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Número de residência: </p>
                    <p>{infos.numeroResidencia}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Bairro: </p>
                    <p>{infos.bairro}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Cidade: </p>
                    <p>{infos.cidade}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Complemento: </p>
                    <p>{infos.complemento}</p>
                  </div>
                </div>
              }
          {
          <div className={styles.paymentInfo}>
            <button className={styles.buttonExpand} onClick={() => handlePaymentInfoClick(i,"paymentInfo", infos.pedido_id, infos.tipo_pagamento)}>Informações de pagamento</button>
            <Expand src="/img/arrowUp.png" alt="expandir informações de endereço e contato" width={30} height={30} className={styles.expand} onClick={() => handlePaymentInfoClick(i,"paymentInfo", infos.pedido_id, infos.tipo_pagamento)} id={`arrowUp_paymentInfo_${i}`} />
            <Expand src="/img/arrowDown.png" alt="diminuir informações de endereço e contato" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handlePaymentInfoClick(i,"paymentInfo", infos.pedido_id, infos.tipo_pagamento)} id={`arrowDown_paymentInfo_${i}`} />
          </div>
          }
           {paymentInfo[i].card && infos.status_pagamento != "pagamento não solicitado" ?
              <div className={`${styles.payment} ${styles.displayNone}`} id={`item_paymentInfo_${i}`}>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Tipo de pagamento: </p>
                    <p>cartão</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Bandeira: </p>
                    <p>{paymentInfo[i].card?.bandeira}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Últimos dígitos: </p>
                    <p>{paymentInfo[i].card?.ultimos_digitos}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Titular: </p>
                    <p>{paymentInfo[i].card?.portador.name}</p>
                  </div>
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Parcelas: </p>
                    <p>{paymentInfo[i].card?.parcelas}</p>
                  </div>
                  {
                    paymentInfo[i].card?.mensagem != "SUCESSO" && 
                    <div className={`${styles.values} ${styles.infos}`}>
                      <p>Mensagem: </p>
                      <p>{paymentInfo[i].card?.mensagem}</p>
                    </div>
                  }
              </div>
              : paymentInfo[i].boleto ? 
              <div className={`${styles.payment} ${styles.displayNone}`} id={`item_paymentInfo_${i}`}>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Nome: </p>
                  <p>{paymentInfo[i].boleto?.titular.nome}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Tipo de pagamento: </p>
                  <p>boleto</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Cpf/Cnpj: </p>
                  <p>{paymentInfo[i].boleto?.titular.tax_id}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Email: </p>
                  <p>{paymentInfo[i].boleto?.titular.email}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Rua: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.rua}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Número de residência: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.numeroResidencia}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Complemento: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.complemento}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Bairro: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.bairro}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Cidade: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.cidade}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Região: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.regiao}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Código de região: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.codigoRegiao}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Cep: </p>
                  <p>{paymentInfo[i].boleto?.titular.endereco.cep}</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Linha de instrução 1: </p>
                  <p>{paymentInfo[i].boleto?.linhasInstrucao.linha_1}</p>
                </div>
                {
                  paymentInfo[i].boleto?.linhasInstrucao.linha_2 && 
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Linha de instrução 2: </p>
                    <p>{paymentInfo[i].boleto?.linhasInstrucao.linha_2}</p>
                  </div>
                }
                {
                  <>
                    <div className={`${styles.values} ${styles.infos}`}>
                      <p>Baixar boleto: </p>
                      <Link className={styles.link} href={paymentInfo[i].boleto?.pdf as string} target="_blank" download="boleto em pdf">baixar boleto</Link>
                    </div>
                  </>
                }
                {paymentInfo[i].boleto?.mensagem != "SUCESSO" && <div className={`${styles.values} ${styles.infos}`}>
                  <p>Mensagem: </p>
                  <p>{paymentInfo[i].boleto?.mensagem}</p>
                </div>
                }
            </div>
            : paymentInfo[i].pix &&
              <div id={`item_paymentInfo_${i}`} className={`${styles.payment} ${styles.displayNone}`}>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Tipo de pagamento: </p>
                  <p>pix</p>
                </div>
                {paymentInfo[i].pix?.tax_id && <div className={`${styles.values} ${styles.infos}`}>
                  <p>Cpf/Cnpj: </p>
                  <p>{paymentInfo[i].pix?.tax_id}</p>
                </div>}
                {paymentInfo[i].pix?.mensagem != "SUCESSO" && paymentInfo[i].pix?.mensagem && <div className={`${styles.values} ${styles.infos}`}>
                  <p>Mensagem: </p>
                  <p>{paymentInfo[i].pix?.mensagem}</p>
                </div>}
              </div>
            }
            <div className={styles.clothingInfo}>
              <button className={styles.buttonExpand} onClick={() => handlePaymentInfoClick(i,"clothing", infos.pedido_id, infos.tipo_pagamento)}>Roupas</button>
              <Expand src="/img/arrowUp.png" alt="expandir informações das roupas do pedido" width={30} height={30} className={styles.expand} onClick={() => handlePaymentInfoClick(i,"clothing", infos.pedido_id, infos.tipo_pagamento)} id={`arrowUp_clothing_${i}`} />
              <Expand src="/img/arrowDown.png" alt="diminuir informações das roupas do pedido" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handlePaymentInfoClick(i,"clothing", infos.pedido_id, infos.tipo_pagamento)} id={`arrowDown_clothing_${i}`} />
            </div>
            {infos.roupa.map((clothing) => {
              return (
              <div id={`item_clothing_${i}`} className={`${styles.clothing} ${styles.displayNone}`} key={clothing.id+clothing.cor+clothing.tamanho}>
                <ClothingImg src={clothing.imagem} alt={clothing.alt} width={80} height={85} />
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Nome: </p>
                  <p className={styles.value}>{clothing.nome}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Cor: </p>
                  <p className={styles.value}>{clothing.cor}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Quantidade: </p>
                  <p className={styles.value}>{clothing.quantidade}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Preço: </p>
                  <p className={styles.value}>R${formatPrice(clothing.preco)}</p>
                </div>
              </div>
            )
            })}
            {infos.tipo_pagamento == "PIX" && (checkPix(infos.criadoEm, 60*4) && infos.status_pagamento == "pagamento não solicitado") && 
              <div>
                <p className={styles.error}>Pix expirado</p>
                <Link href={`/finalizar-compra?retry_payment_id=${infos.pedido_id.substring(5)}&paymentType=${infos.tipo_pagamento}`} className={styles.link}>Gerar novo pix</Link>
              </div>
            }
            {infos.status_pagamento == "recusado" && (!paymentInfo[i].card?.mensagem.includes("não tente novamente") || !paymentInfo[i].card?.mensagem.includes("não tente novamente") || !paymentInfo[i].card?.mensagem.includes("não tente novamente")) && 
              <div>
                <p className={styles.error}>Pagamento recusado</p>
                <Link href={`/finalizar-compra?retry_payment_id=${infos.pedido_id.substring(5)}&paymentType=${infos.tipo_pagamento == "CREDIT_CARD" ? "CARTAO_CREDITO" : "CARTAO_DEBITO"}`} className={styles.link}>Pagar novamente</Link>
              </div>
            }
            {infos.status_pagamento == "BOLETO" && paymentInfo[i].boleto && checkBoleto(paymentInfo[i].boleto?.dataVencimento as string) && 
              <div>
                <p className={styles.error}>Boleto vencido</p>
                <Link href={`/finalizar-compra?retry_payment_id=${infos.pedido_id.substring(5)}&paymentType=${infos.tipo_pagamento}`} className={styles.link}>Pagar novamente</Link>
              </div>
            }
            <p className={styles.cancelOrder}>Deseja cancelar o pedido? Nos chame no whatsapp: 77777</p>
          </div>
          )
        })}
      </> : load ? <p className={styles.load}>carregando...</p> : status == 404 ?
        <div>
          <p className={styles.notFound} style={{marginTop: "25px"}}>Nenhum pedido foi encontrado</p>
          <Link style={{marginLeft: "10px"}} href="/" className={styles.seeClothing}>Ver roupas</Link>
        </div> : status == 500 && <p className={styles.serverError}>Parece que houve um erro! Tente recarregar a página</p>}
        <span aria-hidden={true} id="final" className={`${getOrder && styles.show}`}></span>
        {newPageLoad && 
            <div className={styles.ldsRing} aria-label="carregando" tabIndex={0}>
              <div aria-hidden="true">
                </div>
                <div aria-hidden="true">
                </div>
                <div aria-hidden="true">
                </div>
                <div aria-hidden="true">
              </div>
            </div>
          }
      </section>
    </main>
   </>
  )
}