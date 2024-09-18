"use client"

import { SyntheticEvent, useEffect, useRef, useState } from "react"
import styles from "./getOrder.module.css"
import GetOrder, { getOrderAdmin } from "@/api/manager/clothing/getOrder"
import { useRouter } from "next/navigation"
import PopupError from "@/components/popupError/popupError"
import SpinLoading from "@/components/spinLoading/spinLoading"
import formatPrice from "@/funcs/formatPrice"
import Image from "next/image"
import Expand from "next/image"
import handleArrowClick from "@/funcs/handleArrowClick"
import handleModalClick from "@/funcs/handleModalClick"
import Filter from "./filter"
import UpdateTrackingCodeForm from "./updateTrackingCode"
import Menu from "../menu/menu"
import Success from "@/components/successs/success"
import React from "react"

interface props {
  cookieName?: string
  cookieVal?: string
  updated?: string
}

export interface packageNumbers {
  package_number: number
} 

export default function GetOrderAdmin({cookieName,cookieVal,updated}:props) {
  const router = useRouter()
  const [data, setData] = useState<getOrderAdmin | null>(null)
  const [load, setLoad] = useState<boolean>(true)
  const [popupError, setPopupError] = useState<boolean>(false)
  const [end, setEnd] = useState<boolean>(false)
  const [newPage, setNewPage] = useState<boolean>(false)
  const [newPageLoad, setNewPageLoad] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const closeFilterRef = useRef<HTMLButtonElement | null>(null)
  const buttonToOpenModalRefFilter = useRef<HTMLButtonElement | null>(null)
  const filterRef = useRef<HTMLFormElement | null>(null)

  const closeTrackingCodeRef = useRef<HTMLButtonElement | null>(null)
  const trackingCodeRef = useRef<HTMLFormElement | null>(null)

  const [packageNumbers, setPackageNumbers] = useState<packageNumbers[] | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    if(!end && !newPageLoad) {
      (async function() {
        setPopupError(false)
        if(cookieName == undefined || cookieVal == undefined) {
          router.push("/manager-quikworkout/auth")
          return
        }

        const cookie = cookieName+"="+cookieVal
        var cursor: string | undefined
        if(data?.order?.pedido) {
          setNewPageLoad(true)
          const lastIndex = data.order.pedido.length
          if(lastIndex && lastIndex - 1 >= 0 && data) {
            cursor = data.order.pedido[lastIndex - 1].criadoEm
          }
        }
        
        if(isNaN(Number(updated)) || Number(updated) <= 0) {
          updated = undefined
        }
        
        const res = await GetOrder(cookie, cursor, updated)
        if(res.status == 401) {
          router.push("/manager-quikworkout/auth")
          return
        }

        if((res.status == 404 || res.status == 500) && !data?.order) {
          if(res.status == 404) {
            setEnd(true)
          }
          setLoad(false)
          setNewPage(false)
          setNewPageLoad(false)
          setData(res)
          return
        }
        if(data?.order && res.status == 500) {
          setPopupError(true)
        }
        if (data?.order && res.status == 404) {
          setEnd(true)
        }
        if(!data?.order?.pedido && res.status == 200) {
          if(res.order && res.order?.pedido.length - 1 <= 2) {
            setEnd(true)
          }
          setData(res)
        } else if(data?.order?.pedido && res.status == 200 && res.order?.pedido) {
          data.order?.pedido.push(...res.order.pedido)
          setData(data)
        }

        setTimeout(() => {
          setNewPageLoad(false)
        }, 50);
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

  return (
    <>
      {popupError && <PopupError handleOut={() => setPopupError(false)} />}
      {load && <SpinLoading />}
      {success && <Success msg="código enviado com sucesso" setSuccess={setSuccess} success={success} />}
      <UpdateTrackingCodeForm setSuccess={setSuccess} packageNumbers={packageNumbers} setData={setData} setPopupError={setPopupError} order_id={orderId} setLoad={setLoad} cookieName={cookieName} cookieVal={cookieVal} closeRef={closeTrackingCodeRef} modalRef={trackingCodeRef} />
      <Filter load={load} closeRef={closeFilterRef} modalRef={filterRef} setLoad={setLoad}/>
      <Menu cookieName={cookieName} cookieVal={cookieVal} />
      <main className={`${styles.main} ${load && styles.opacity} ${data?.status == 500 && styles.mainError}`}>
        <section>
          {data?.status == 500 && <p>Ooops! Parece que houve um erro,tente recarregar a página</p>}
          {
            data?.status != 500 && <div className={styles.order}>
            <h1 className={styles.title}>Pedidos</h1>
            <button className={styles.button} onClick={() => handleModalClick(filterRef, buttonToOpenModalRefFilter, closeFilterRef, styles.active, "flex")} ref={buttonToOpenModalRefFilter}>Filtrar</button>
            {data?.order && <p className={styles.p}>{end ? "Todos os pedidos foram carregados" : `Ainda exitem pedidos a serem carregados`}</p>}
            {((data?.status == 404) && !data.order?.pedido) && <p className={`${styles.p}`}>Nenhum pedido foi encontrado</p>}
            {load && !data && <p className={styles.p}>carregando pedidos aguarde...</p>}
          </div>
          }
          {data?.order?.pedido.map((order) => {
            return (
              <div className={styles.item} key={order.pedido_id}>
                <div className={`${styles.values}`}>
                  <p>Pedido id: </p>
                  <p>{order.pedido_id.substring(5)}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Status do pagamento: </p>
                  <p className={order.status_pagamento == "pago" ? styles.green : ""}>{order.status_pagamento}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Tipo do pagamento: </p>
                  <p>{order.tipo_pagamento == "DEBIT_CARD"? "cartão de débito" : order.tipo_pagamento == "CREDIT_CARD" ? "cartão de crédito" : order.tipo_pagamento.toLowerCase()}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Rua: </p>
                  <p>{order.rua}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Número de residência: </p>
                  <p>{order.numeroResidencia}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Complemento: </p>
                  <p>{order.complemento}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Bairro: </p>
                  <p>{order.bairro}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Cidade: </p>
                  <p>{order.cidade}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Email: </p>
                  <p>{order.email}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Telefone: </p>
                  <p>{order.telefone}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Serviço: </p>
                  <p>{order.servico}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>CPF/CNPJ: </p>
                  <p>{order.cpfCnpj}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Frete: </p>
                  <p>{order.frete == 0 ? "grátis" : formatPrice(order.frete)}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p>Preço total: </p>
                  <p>R${formatPrice(order.precoTotal)}</p>
                </div>
                {
                  order.pacotes.map(({...pacote},j) => {
                    const id = Math.floor(Math.random() * 1000000) + 1
                    return (
                      <React.Fragment key={"vol"+j}>
                        <div className={styles.volumesInfo}>
                          <button className={styles.buttonExpand} onClick={() => handleArrowClick((id), "volume", styles.displayNone)}>{order.pacotes.length > 1 ? `Pacote ${pacote.numeroPacote + 1}` : `Volume`}</button>
                          <Expand src="/img/arrowUp.png" alt="expandir informações de volumes" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick((id), "volume", styles.displayNone)} id={`arrowUp_volume_${(id)}`} />
                          <Expand src="/img/arrowDown.png" alt="diminuir informações de volumes" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick((id), "volume", styles.displayNone)} id={`arrowDown_volume_${(id)}`}/>
                        </div>
                          <div className={`${styles.volumes} ${styles.displayNone}`} id={`item_volume_`+(id)}>
                            <div className={styles.volume}>
                                <div className={`${styles.values}`}>
                                  <p className={styles.field}>Altura: </p>
                                  <p className={styles.value}>{pacote.altura}</p>
                                </div>
                                <div className={`${styles.values}`}>
                                  <p className={styles.field}>Largura: </p>
                                  <p className={styles.value}>{pacote.largura}</p>
                                </div>
                                <div className={`${styles.values}`}>
                                  <p className={styles.field}>Comprimento: </p>
                                  <p className={styles.value}>{pacote.comprimento}</p>
                                </div>
                                <div className={`${styles.values}`}>
                                  <p className={styles.field}>Peso: </p>
                                  <p className={styles.value}>{pacote.peso}</p>
                                </div>
                                <div className={`${styles.values}`}>
                                  <p className={styles.field}>Preço: </p>
                                  <p className={styles.value}>R${formatPrice(pacote.preco)}</p>
                                </div>
                            </div>
                          <div className={styles.clothingInfos}>
                            <button className={styles.buttonExpand} onClick={() => handleArrowClick((id), "clothing", styles.displayNone)}>Roupa(s)</button>
                            <Expand src="/img/arrowUp.png" alt="expandir informações de roupa" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick((id), "clothing", styles.displayNone)} id={`arrowUp_clothing_${(id)}`} />
                            <Expand src="/img/arrowDown.png" alt="diminuir informações de roupa" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick((id), "clothing", styles.displayNone)} id={`arrowDown_clothing_${(id)}`}/>
                          </div>
                          <div id={`item_clothing_${((id))}`} className={`${styles.clothing} ${styles.displayNone}`}>
                            {pacote.roupa.map(({...clothing}) =>
                                <div key={clothing.id+clothing.tamanho+clothing.cor}>
                                  <Image src={clothing.imagem} alt={clothing.alt} width={80} height={85} />
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
                                    <div className={`${styles.values}`}>
                                      <p className={styles.field}>Preço: </p>
                                      <p className={styles.value}>R${formatPrice(clothing.preco)}</p>
                                    </div>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })
                }
                <button disabled={load} className={`${styles.add}`} onClick={(event: SyntheticEvent) => {
                  const packageNums = order.pacotes.map(({...pacotes}) => {
                    return {
                      package_number: pacotes.numeroPacote,
                    }
                  }) 
                  setPackageNumbers(packageNums)
                  setOrderId(order.pedido_id)
                  let button: HTMLButtonElement | null = null
                  if(event.target instanceof HTMLImageElement) {
                    if(event.target.parentElement instanceof HTMLButtonElement) {
                      button = event.target.parentElement
                    }
                  }
                  if(event.target instanceof HTMLButtonElement) {
                    button = event.target
                  }
                  if(button instanceof HTMLButtonElement) {
                    handleModalClick(trackingCodeRef, button, closeTrackingCodeRef, styles.active, "flex")
                  }
                }}><Image src="/img/add.png" width={20} height={21} alt="adicionar código de rastreio"/></button>
            </div>
            )
          })}
        <span aria-hidden={true} id="final" className={`${data && styles.show}`}></span>
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
          {end && data?.status != 404 && data?.order?.pedido.length != 0 && <p className={styles.end}>Todos os pedidos foram carregados</p>}
        </section>
      </main>
    </>
  )
}