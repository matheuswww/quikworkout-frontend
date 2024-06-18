import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styles from './products.module.css'
import ArrowUp from 'next/image'
import ArrowDown from 'next/image'
import { dataGetClothingCart } from "@/api/clothing/getClothingCart"
import ClothingImg from 'next/image'
import formatPrice from "@/funcs/formatPrice"

interface props {
  clothing: dataGetClothingCart[]
  totalPrice: string
  freight: string | null
  responseError: string | null
}

export default function Products({clothing, totalPrice, freight, responseError}:props) {
  const [productsForm, setProductsForm] = useState<boolean>(false)
  const [totalPriceWithFreight, setTotalPriceWithFreight] = useState<string | null>(null)

  useEffect(() => {
    if(freight == null) {
      setTotalPriceWithFreight(null)
      return
    }
    let val: string | null = freight
    let val2: string | null = totalPrice
    
    if(freight?.includes(",")) {
      val = freight.replace(",",".")
    }
    if(totalPrice.includes(",")) {
      val2 = totalPrice.replace(",",".")
    }
    if(Number(totalPrice) >= 200) {
      setTotalPriceWithFreight(totalPrice)
      return
    }
    let total = Number(val2)+Number(val)
    if(!isNaN(total)) {
      setTotalPriceWithFreight(total.toString())
      return
    }
    
    setTotalPriceWithFreight(null)
  }, [freight])

  return (
    <>
      <div style={{display: "flex"}}>
      {
        !productsForm ? 
        <button className={styles.arrow} type="button" id="arrowProducts" onClick={(() => setProductsForm((a) => !a))} aria-label="diminuir sessão de revisão de produtos"><ArrowUp src="/img/arrowUp.png" alt="seta para cima" width={24} height={24} /></button>
        :
        <button className={styles.arrow} type="button" id="arrowProducts" onClick={(() => setProductsForm((a) => !a))} aria-label="expandir sessão de revisão de produto"><ArrowDown src="/img/arrowDown.png" alt="seta para baixo" width={24} height={24}/></button>
      }
      <label className={styles.label} style={{marginTop: "18px"}} htmlFor="arrowProducts">Revisar produtos</label>
    </div>
    <section className={`${styles.section}`}>
      <div className={`${productsForm && styles.displayNone}`}>
        <p className={styles.price}>Preço total: R${totalPrice}</p>
        {Number(totalPrice.includes(",") ? Number(totalPrice.replace(",",".")) : Number(totalPrice)) >= 200 ? <p className={styles.price}>Frete grátis</p> : !totalPriceWithFreight ? <p className={styles.price}>Digite seu cep acima para visualizar seu preço total juntamente com o frete</p> : <p className={styles.price}>Preço total com frete R${totalPriceWithFreight}</p>}
        <button style={{marginLeft: "12px",marginTop: "22px"}} type="submit" className={styles.button}>Finalizar compra</button>
        { <p className={styles.error}>{responseError}</p>}
        {clothing.map((infos) => {
          return (
            <div className={`${styles.clothing}`} key={infos.roupa_id+infos.cor+infos.tamanho}>
              <ClothingImg src={infos.imagem} alt={infos.alt} width={80} height={85} className={`${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}/>
              <div className={`${styles.values} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}>
                <p className={styles.field}>Nome: </p>
                <p className={styles.value}>{infos.nome}</p>
              </div>
              <div className={`${styles.values} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}>
                <p className={styles.field}>Cor: </p>
                <p className={styles.value}>{infos.cor}</p>
              </div>
              <div className={`${styles.values} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}>
                <p className={styles.field}>Quantidade: </p>
                <p className={styles.value}>{infos.quantidade}</p>
              </div>
              <div className={`${styles.values} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}>
                <p className={styles.field}>Preço: </p>
                <p className={styles.value}>R${formatPrice(infos.preco)}</p>
              </div>
              <div className={`${styles.values}`}>
                {(infos.excedeEstoque || !infos.disponivel) && <p className={styles.alert}>{infos.excedeEstoque ? `roupa indisponível` : `quantidade pedida indisponível,quantidade disponível: ${infos.quantidadeDisponivel}`}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
    </>
  )
}