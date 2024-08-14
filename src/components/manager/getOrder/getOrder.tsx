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

interface props {
  cookieName?: string
  cookieVal?: string
  updated?: string
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
  const [error, setResponseError] = useState<string | null>(null)

  const closeFilterRef = useRef<HTMLButtonElement | null>(null)
  const buttonToOpenModalRefFilter = useRef<HTMLButtonElement | null>(null)
  const filterRef = useRef<HTMLFormElement | null>(null)

  const closeTrackingCodeRef = useRef<HTMLButtonElement | null>(null)
  const trackingCodeRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    if(!end) {
      (async function() {
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
        if(res.status == 404 || res.status == 500) {
          setEnd(true)
          setLoad(false)
          setNewPageLoad(false)
          setData(res)
          return
        }
        if(!data?.order?.pedido && res.status == 200) {
          setData(res)
          if(res.order?.pedidosRestantes == 0) {
            setEnd(true)
          }
        } else if(data?.order?.pedido && res.status == 200) {
          res.order?.pedido.push(...data.order.pedido)
          setData(res)
          if(res.order?.pedidosRestantes == 0) {
            setEnd(true)
          }
        }
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

  return (
    <>
      {popupError && <PopupError handleOut={() => setPopupError(false)} />}
      {load && <SpinLoading />}
      <UpdateTrackingCodeForm setData={setData} error={error} setResponseError={setResponseError} setPopupError={setPopupError} order_id={orderId} setOrderId={setOrderId} setLoad={setLoad} cookieName={cookieName} cookieVal={cookieVal} closeRef={closeTrackingCodeRef} modalRef={trackingCodeRef} />
      <Filter load={load} closeRef={closeFilterRef} modalRef={filterRef} setLoad={setLoad}/>
      <Menu cookieName={cookieName} cookieVal={cookieVal} />
      <main className={`${styles.main} ${load && styles.opacity} ${data?.status == 500 && styles.mainError}`}>
        <section>
          {data?.status == 500 && <p>Ooops! Parece que houve um erro,tente recarregar a página</p>}
          {
            data?.status != 500 && <div className={styles.order}>
            <h1 className={styles.title}>Pedidos</h1>
            <button className={styles.button} onClick={() => handleModalClick(filterRef, buttonToOpenModalRefFilter, closeFilterRef, styles.active, "flex")} ref={buttonToOpenModalRefFilter}>Filtrar</button>
            {data?.order?.pedidosRestantes != undefined && <p className={styles.p}>{data.order.pedidosRestantes == 0 ? "Todos os pedidos foram carregados" : `Pedidos não carregados: ${data.order.pedidosRestantes}`}</p>}
            {((data?.status == 404 || data?.order?.pedidosRestantes == 0) && !data.order?.pedido) && <p className={`${styles.p}`}>Nenhum pedido foi encontrado</p>}
            {load && !data && <p className={styles.p}>carregando pedidos aguarde...</p>}
          </div>
          }
          {error && <p className={styles.error}>{error}</p>}
          {data?.order && data?.order.pedido.map(({...order},i) => {
              return (
                <div key={order.pedido_id} className={styles.item}>
                  <div className={`${styles.values}`}>
                    <p>Pedido id: </p>
                    <p>{order.pedido_id.substring(5)}</p>
                  </div>
                  <div className={`${styles.values}`}>
                    <p>Status pagamento: </p>
                    <p>{order.status_pagamento}</p>
                  </div>
                  <div className={`${styles.values}`}>
                    <p>Tipo pagamento: </p>
                    <p>{order.tipo_pagamento}</p>
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
                    <p>{order.frete == 0 ? "grátis" : order.frete}</p>
                  </div>
                  <div className={`${styles.values}`}>
                    <p>Preço total: </p>
                    <p>R${order.precoTotal}</p>
                  </div>
                  <div className={styles.clothingInfos}>
                    <button className={styles.buttonExpand} onClick={() => handleArrowClick(i, "volume", styles.displayNone)}>Volumes</button>
                    <Expand src="/img/arrowUp.png" alt="expandir informações de volumes" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick(i, "volume", styles.displayNone)} id={`arrowUp_volume_${i}`} />
                    <Expand src="/img/arrowDown.png" alt="diminuir informações de volumes" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(i, "volume", styles.displayNone)} id={`arrowDown_volume_${i}`}/>
                  </div>
                  <div className={`${styles.volumes} ${styles.displayNone}`} id={`item_volume_`+i}>
                  {
                    order.volume.map(({...volume},j) => {
                      return (
                        <div className={styles.volume} key={"volume"+i+j}>
                          <div className={`${styles.values}`}>
                              <p className={styles.field}>Altura: </p>
                              <p className={styles.value}>{volume.altura}</p>
                            </div>
                            <div className={`${styles.values}`}>
                              <p className={styles.field}>Largura: </p>
                              <p className={styles.value}>{volume.largura}</p>
                            </div>
                            <div className={`${styles.values}`}>
                              <p className={styles.field}>Comprimento: </p>
                              <p className={styles.value}>{volume.comprimento}</p>
                            </div>
                            <div className={`${styles.values}`}>
                              <p className={styles.field}>Peso: </p>
                              <p className={styles.value}>{volume.peso}</p>
                            </div>
                            <div className={`${styles.values}`}>
                              <p className={styles.field}>Preço: </p>
                              <p className={styles.value}>R${volume.valor}</p>
                            </div>
                        </div>
                      )
                    })
                  }
                  </div>
                  <div className={styles.clothingInfos}>
                    <button className={styles.buttonExpand} onClick={() => handleArrowClick(i, "clothing", styles.displayNone)}>Roupas</button>
                    <Expand src="/img/arrowUp.png" alt="expandir informações de roupa" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick(i, "clothing", styles.displayNone)} id={`arrowUp_clothing_${i}`} />
                    <Expand src="/img/arrowDown.png" alt="diminuir informações de roupa" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(i, "clothing", styles.displayNone)} id={`arrowDown_clothing_${i}`}/>
                  </div>
                  <div id={`item_clothing_${i}`} className={`${styles.clothing} ${styles.displayNone}`}>
                    {order.roupa.map(({...clothing}) => {
                      return (
                        <div key={clothing.id+clothing.tamanho+clothing.cor}>
                          <Image src={clothing.imagem} alt={"#"} width={80} height={85} />
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
                  </div>
                  <button disabled={load} className={`${styles.add}`} onClick={(event: SyntheticEvent) => {
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
        </section>
      </main>
    </>
  )
}