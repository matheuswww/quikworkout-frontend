"use client"

import { useEffect, useState } from "react"
import styles from "./getOrder.module.css"
import GetOrder, { getOrderAdmin } from "@/api/manager/clothing/getOrder"
import { useRouter } from "next/navigation"
import PopupError from "@/components/popupError/popupError"
import SpinLoading from "@/components/spinLoading/spinLoading"
import formatPrice from "@/funcs/formatPrice"
import Image from "next/image"
import Expand from "next/image"
import handleArrowClick from "@/funcs/handleArrowClick"

interface props {
  cookieName?: string
  cookieVal?: string
}

export default function GetOrderAdmin({cookieName,cookieVal}:props) {
  const router = useRouter()
  const [data, setData] = useState<getOrderAdmin | null>(null)
  const [load, setLoad] = useState<boolean>(false)
  const [popupError, setPopupError] = useState<boolean>(false)

  useEffect(() => {
    (async function() {
      if(cookieName == undefined || cookieVal == undefined) {
        router.push("/manager-quikworkout/auth")
        return
      }
      setLoad(true)
      const cookie = cookieName+"="+cookieVal
      const res = await GetOrder(cookie)
      if(res.status == 401) {
        router.push("/manager-quikworkout/auth")
        return
      }
      if(res.status == 200) {
        console.log(res)
        setData(res)
      }
      setLoad(false)
    }())
  }, [])

  return (
    <>
      {popupError && <PopupError handleOut={() => setPopupError(false)} />}
      {load && <SpinLoading />}
      <main className={styles.main}>
        <section>
          {data?.order && data?.order.pedido.map(({...order},i) => {
              return (
                <div>
                  <p>Pedido id: {order.order_id}</p>
                  <p>Status pagamento: {order.status_pagamento}</p>
                  <p>Tipo pagamento: {order.tipo_pagamento}</p>
                  <p>Rua: {order.rua}</p>
                  <p>Número de residência: {order.numeroResidencia}</p>
                  <p>Complemento: {order.complemento}</p>
                  <p>Bairro: {order.bairro}</p>
                  <p>Cidade: {order.cidade}</p>
                  <p>Email: {order.email}</p>
                  <p>Telefone: {order.telefone}</p>
                  <p>Serviço: {order.servico}</p>
                  <p>CPF/CNPJ: {order.cpfCnpj}</p>
                  <p>Frete: {order.frete == 0 ? "grátis" : order.frete}</p>
                  <p>Preço total: {order.precoTotal}</p>
                  <div className={styles.clothingInfos}>
                    <button className={styles.buttonExpand} onClick={() => handleArrowClick(i, "clothing", styles.displayNone)}>Roupas</button>
                    <Expand src="/img/arrowUp.png" alt="expandir informações de roupa" width={30} height={30} className={`${styles.expand}`} onClick={() => handleArrowClick(i, "clothing", styles.displayNone)} id={`arrowUp_clothing_${i}`} />
                    <Expand src="/img/arrowDown.png" alt="diminuir informações de ropua" width={30} height={30} className={`${styles.expand} ${styles.displayNone}`} onClick={() => handleArrowClick(i, "clothing", styles.displayNone)} id={`arrowDown_clothing_${i}`}/>
                  </div>
                  <div id={`item_clothing_${i}`} className={`${styles.clothing} ${styles.displayNone}`}>
                  {order.roupa.map(({...clothing},j) => {
                    return (
                      <>
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
                      </>
                    )
                  })}
                  </div>
                </div>
              )
          })}
        </section>
      </main>
    </>
  )
}