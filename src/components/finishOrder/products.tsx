import { Dispatch, SetStateAction, useEffect } from "react"
import styles from './products.module.css'
import { dataGetClothingCart } from "@/api/clothing/getClothingCart"
import ClothingImg from 'next/image'
import formatPrice from "@/funcs/formatPrice"
import { getOrderDetailResponse } from "@/api/clothing/getOrderDetail"
import Recaptcha from "../recaptcha/recaptcha"
import Link from "next/link"

interface props {
  clothing: dataGetClothingCart[] | null | undefined
  retryPaymentData: getOrderDetailResponse | null
  totalPrice: string
  freight: string | null
  responseError: string | null
  totalPriceWithFreight: string | null
  setTotalPriceWithFreight: Dispatch<SetStateAction<string | null>>
  setPrivacy: Dispatch<SetStateAction<boolean>>
  privacyError: string | null
  recaptchaError: string | null
}

export default function Products({clothing, totalPrice, freight, responseError, retryPaymentData, setTotalPriceWithFreight, totalPriceWithFreight, recaptchaError, privacyError, setPrivacy}:props) {
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
      setTotalPriceWithFreight(formatPrice(Number(totalPrice)))
      return
    }
    let total = Math.round((Number(val2)+Number(val)) * 100)/100
    if(!isNaN(total)) {
      setTotalPriceWithFreight(formatPrice(total))
      return
    }
    
    setTotalPriceWithFreight(null)
  }, [freight])

  return (
    <>
    <section className={`${styles.section}`}>
      <div>
        <p className={styles.price}>Preço total: R${totalPrice}</p>
        {Number(totalPrice.includes(",") ? Number(totalPrice.replace(",",".")) : Number(totalPrice)) >= 200 ? <p style={{marginBottom: "10px"}} className={styles.price}>Frete grátis</p> : !totalPriceWithFreight ? <p style={{marginBottom: "10px"}} className={styles.price}>Digite seu cep acima para visualizar seu preço total juntamente com o frete</p> : <p style={{marginBottom: "10px"}} className={styles.price}>Preço total com frete R${totalPriceWithFreight}</p>}
        <Recaptcha className={styles.recaptcha} classNameP={styles.recaptchaP} />
        { <p className={styles.error}>{responseError}</p> }
        <div className={styles.privacy}>
          <label htmlFor="privacy">Aceitar <Link href="/politica-privacidade-pagamento">política de privacidade</Link></label>
          <input type="checkbox" id="privacy" onClick={() => setPrivacy((p) => !p)} />
        </div>
        {recaptchaError && <p style={{marginBottom: "15px"}} className={styles.error}>{recaptchaError}</p>}
        {privacyError && <p style={{marginBottom: "15px"}} className={styles.error}>{privacyError}</p>}
        <button style={{marginLeft: "12px",marginTop: "0px"}} type="submit" className={styles.button}>Finalizar compra</button>
        {clothing?.map((infos) => {
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
        {retryPaymentData?.data && typeof retryPaymentData?.data == "object" && "pedido" in retryPaymentData.data && retryPaymentData.data.pedido.pacotes.map(({...packages}) => 
          packages.roupa.map(({...infos}) => {
            return (
              <div className={`${styles.clothing}`} key={infos.id+infos.cor+infos.tamanho}>
                <ClothingImg src={infos.imagem} alt={infos.alt} width={80} height={85} />
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Nome: </p>
                  <p className={styles.value}>{infos.nome}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Cor: </p>
                  <p className={styles.value}>{infos.cor}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Quantidade: </p>
                  <p className={styles.value}>{infos.quantidade}</p>
                </div>
                <div className={`${styles.values}`}>
                  <p className={styles.field}>Preço: </p>
                  <p className={styles.value}>R${formatPrice(infos.preco)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
    </>
  )
}