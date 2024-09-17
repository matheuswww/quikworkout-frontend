"use client"

import { useRouter } from "next/navigation"
import React, { SyntheticEvent, useEffect, useState } from "react"
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
import handleArrowClick from "@/funcs/handleArrowClick"
import Image from "next/image"

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
    if(!end && !newPageLoad) {
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
          }
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
            if(res.data[i].tipo_pagamento == "PIX" && res.data[i].status_pagamento != "SUCESSO" && res.data[i].status_pagamento != "autorizado" && res.data[i].status_pagamento != "cancelado") {
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
        setNewPage(false)
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
      handleArrowClick(index, type, styles.displayNone) 
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
        handleArrowClick(index, type, styles.displayNone) 
      });
    }
  }

  function copyLink(event: SyntheticEvent, index: number) {
    event.preventDefault();
    const link = paymentInfo[index]?.pix?.link
    if (event.target instanceof HTMLElement && link) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link)
          .then(() => window.alert("link de pagamento copiado"))
          .catch(err => console.error('Failed to copy the link: ', err))
      } else {
        console.error('Clipboard API is not supported.');
      }
    }
  }

  function copyCode(event: SyntheticEvent, code: string) {
    event.preventDefault();
    if (event.target instanceof HTMLElement) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code)
          .then(() => window.alert("código de rastreio copiado"))
          .catch(err => console.error('Failed to copy the code: ', err))
      } else {
        console.error('Clipboard API is not supported.');
      }
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
        getOrder.map((infos,i) => {
          return (
            <div key={infos.pedido_id} className={`${styles.item}`} >
                <div className={styles.values}>
                  <p>ID do pedido: </p>
                  <p>{infos.pedido_id.substring(5)}</p>
                </div>
                {infos.status_pagamento != "pago" &&
                <div className={styles.values}>
                  <p>Status do pagamento: </p>
                  <p>{infos.status_pagamento}</p>
                </div>
                }
                {
                  infos.motivoCancelamentoEnvio && infos.motivoCancelamentoEnvio != "" && 
                  <div className={`${styles.values}`}>
                    <p>Motivo do cancelamento: </p>
                    <p>{infos.motivoCancelamentoEnvio}</p>
                  </div>
                }
                <div className={styles.values}>
                  <p>Preço: </p>
                  <p>R${formatPrice(Math.round((infos.precoTotal - infos.frete) * 100)/100)}</p>
                </div>
                <div className={styles.values}>
                  <p>Frete: </p>
                  <p>{infos.frete == 0 ? "grátis" : `R$${formatPrice(infos.frete)}`}</p>
                </div>
                <div className={styles.values}>
                  <p>Total: </p>
                  <p>R${formatPrice(infos.precoTotal)}</p>
                </div>
                {infos.status_pagamento == "pagamento não solicitado" && paymentInfo[i]?.pix && paymentInfo[i].pix?.qrcode && paymentInfo[i].pix?.dataExpiracao == "não expirada" &&
                  <div className={`${styles.values} ${styles.infos} ${styles.qrcode}`}>
                    <p>QR CODE para pagamento: </p>
                    <QRCODE src={paymentInfo[i].pix?.qrcode as string} alt="qr code para pagamento via pix" width={220} height={220}/>
                    <button onClick={(event: SyntheticEvent) => copyLink(event, i)} className={styles.button}>Copiar link de pagamento</button>
                  </div>
                }
                {infos?.pacotes[0]?.codigoRastreio != "" && infos.status_pagamento != "cancelado" ?
                  <>
                    {infos.pacotes.length > 1 && <p className={styles.p}>Você possui {infos.pacotes.length} pacotes a caminho</p>}
                    {infos.pacotes.map(({rastreio,codigoRastreio},v) => {
                      const id = Math.floor(Math.random() * 1000000) + 1
                      return (
                        <React.Fragment key={`codigoRastreio${v}`}>
                          <div className={styles.packageInfo}>
                            {infos.pacotes.length > 1 ? <button className={styles.buttonExpand} onClick={() => handleArrowClick(id, "package", styles.displayNone)}>Rastreio do pacote {v + 1}</button> : <button className={styles.buttonExpand} onClick={() => handleArrowClick(id, "package", styles.displayNone)}>Rastreio do pacote</button>}
                            <Expand src="/img/arrowUp.png" alt="expandir informações de rastreio" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick(id, "package", styles.displayNone)} id={`arrowUp_package_${id}`} />
                            <Expand src="/img/arrowDown.png" alt="diminuir informações de rastreio" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(id, "package", styles.displayNone)} id={`arrowDown_package_${id}`} />
                          </div>
                          {
                            rastreio.acao != "" || rastreio.data != "" || rastreio.observacao != "" || rastreio.ocorrencia != "" ?
                            <>
                              <div id={`item_package_${id}`} className={`${styles.displayNone} ${styles.package}`}>
                                {rastreio.acao != "" &&
                                  <div className={`${styles.values} ${styles.infos}`}>
                                    <p>Rastreio</p>
                                    <p>{rastreio.ocorrencia}</p>
                                  </div>}
                                {rastreio.ocorrencia != "" &&
                                  <div className={`${styles.values} ${styles.infos}`}>
                                    <p>Ocorrência</p>
                                    <p>{rastreio.ocorrencia}</p>
                                  </div>}
                                {rastreio.observacao != "" &&
                                  <div className={`${styles.values} ${styles.infos}`}>
                                    <p>Observação</p>
                                    <p>{rastreio.observacao}</p>
                                  </div>}
                                {rastreio.data != "" &&
                                  <div className={`${styles.values} ${styles.infos}`}>
                                    <p>Data de entrega</p>
                                    <p>{rastreio.data}</p>
                                  </div>}
                              </div>
                            </>
                          :
                            <div id={`item_package_${id}`} className={`${styles.displayNone} ${styles.package}`}>
                               <div className={`${styles.values} ${styles.infos}`}>
                                <p>Digite seu código de rastreio aqui: </p>
                                <Link className={styles.link} href={"https://www.kangu.com.br/rastreio"} target="_blank">rastrear pacote</Link> 
                               </div>
                               <div className={`${styles.values} ${styles.infos}`}>
                                <label htmlFor="tracking" className={styles.labelTrackingCode}>Código de rastreio: </label>
                                <p>{codigoRastreio}</p>
                                <button onClick={(e) => copyCode(e, codigoRastreio)} id="tracking" aria-label="copiar código de rastreio" className={styles.copyCode}><Image src="/img/copy.png" height={22} width={21} alt="icone para copiar valor"/></button>
                               </div>
                            </div>
                          }
                          </React.Fragment>
                        )
                      })
                      }
                  </>
                : infos.status_pagamento == "pago" &&
                <div className={styles.values}>
                  <p>Rastreio do pedido: </p>
                  <p>aguardando ser entregue a transportadora</p>
                </div>
              }
            <div className={styles.addressInfo}>
              <button className={styles.buttonExpand} onClick={() => handleArrowClick(i, "address", styles.displayNone)}>Informações de endereço e contato</button>
              <Expand src="/img/arrowUp.png" alt="expandir informações de endereço e contato" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick(i, "address", styles.displayNone)} id={`arrowUp_address_${i}`} />
              <Expand src="/img/arrowDown.png" alt="diminuir informações de endereço e contato" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(i, "address", styles.displayNone)} id={`arrowDown_address_${i}`}/>
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
           {paymentInfo[i]?.card && infos.status_pagamento != "pagamento não solicitado" ?
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
                  {
                    paymentInfo[i].card?.parcelas != 0 &&
                    <div className={`${styles.values} ${styles.infos}`}>
                      <p>Parcelas: </p>
                      <p>{paymentInfo[i].card?.parcelas}</p>
                    </div>
                  }
                  {
                    paymentInfo[i].card?.mensagem != "SUCESSO" && 
                    <div className={`${styles.values} ${styles.infos}`}>
                      <p>Mensagem: </p>
                      <p>{paymentInfo[i].card?.mensagem}</p>
                    </div>
                  }
              </div>
              : paymentInfo[i]?.boleto ? 
              <div className={`${styles.payment} ${styles.displayNone}`} id={`item_paymentInfo_${i}`}>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Tipo de pagamento: </p>
                  <p>boleto</p>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Baixar boleto: </p>
                  <Link className={styles.link} href={paymentInfo[i].boleto?.pdf as string} target="_blank" download="boleto em pdf">baixar boleto</Link>
                </div>
                <div className={`${styles.values} ${styles.infos}`}>
                  <p>Nome: </p>
                  <p>{paymentInfo[i].boleto?.titular.nome}</p>
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
                  <div className={`${styles.values} ${styles.infos}`}>
                    <p>Data de vencimento </p>
                    <p>{paymentInfo[i].boleto?.dataVencimento}</p>
                  </div>
                }
                {paymentInfo[i].boleto?.mensagem != "SUCESSO" && <div className={`${styles.values} ${styles.infos}`}>
                  <p>Mensagem: </p>
                  <p>{paymentInfo[i].boleto?.mensagem}</p>
                </div>
                }
            </div>
            : paymentInfo[i]?.pix &&
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
          
            {infos.pacotes.map((pacote,j) =>
            {
              const id = Math.floor(Math.random() * 1000000) + 1
              return (
                <React.Fragment key={"pac"+j}>
                  <div className={styles.clothingInfo}>
                    <button className={styles.buttonExpand} onClick={() => handleArrowClick(id,"clothing", styles.displayNone)} key={`item_button_${id}`}>Roupa(s) {infos.pacotes.length > 1 && `do pacote ${j + 1}`}</button>
                    <Expand src="/img/arrowUp.png" alt="expandir informações das roupas do pedido" width={30} height={30} className={styles.expand} onClick={() => handleArrowClick(id,"clothing", styles.displayNone)} id={`arrowUp_clothing_${id}`} />
                    <Expand src="/img/arrowDown.png" alt="diminuir informações das roupas do pedido" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(id,"clothing", styles.displayNone)} id={`arrowDown_clothing_${id}`} />
                  </div>
                  <div id={`item_clothing_${id}`} className={`${styles.clothing} ${styles.displayNone}`}>
                    {pacote.roupa.map((clothing) => 
                      {
                        return (
                          <div key={clothing.id+clothing.tamanho+clothing.cor}>
                              <ClothingImg src={clothing.imagem} alt={clothing.alt} width={80} height={85} />
                              <div className={`${styles.values}`}>
                                <p className={styles.field}>Preço: </p>
                                <p className={styles.value}>R${formatPrice(clothing.preco)}</p>
                              </div>
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
                                <p className={styles.field}>Tamanho: </p>
                                <p className={styles.value}>{clothing.tamanho}</p>
                              </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </React.Fragment>
              )
            }
            )}
            {infos.tipo_pagamento == "PIX" && paymentInfo[i]?.pix?.dataExpiracao == "expirada" &&
              <div>
                <p className={styles.error}>Pix expirado</p>
                <Link href={`/finalizar-compra?retry_payment_id=${infos.pedido_id.substring(5)}&paymentType=${infos.tipo_pagamento}`} className={styles.link}>Gerar novo pix</Link>
              </div>
            }
            {infos.status_pagamento == "recusado" && !paymentInfo[i]?.card?.mensagem.includes("não tente novamente") && 
              <div>
                <p className={styles.error}>Pagamento recusado</p>
                <Link href={`/finalizar-compra?retry_payment_id=${infos.pedido_id.substring(5)}&paymentType=${infos.tipo_pagamento == "CREDIT_CARD" ? "CARTAO_CREDITO" : "CARTAO_DEBITO"}`} className={styles.link}>Pagar novamente</Link>
              </div>
            }
            <p className={styles.cancelOrder}>Deseja cancelar o pedido? Nos chame no: <Link style={{fontSize: ".9rem"}} className={styles.link} href="https://api.whatsapp.com/send/?phone=5513997763561&text&type=phone_number&app_absent=0" target="_blank">whatsapp</Link></p>
          </div>
          )  
        })
      : load ? <p className={styles.load}>carregando...</p> : status == 404 ?
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