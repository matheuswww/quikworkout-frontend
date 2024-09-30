import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import styles from './products.module.css';
import { dataGetClothingCart } from '@/api/clothing/getClothingCart';
import ClothingImg from 'next/image';
import formatPrice from '@/funcs/formatPrice';
import { getOrderDetailResponse } from '@/api/clothing/getOrderDetail';
import Recaptcha from '../recaptcha/recaptcha';
import Link from 'next/link';
import ArrowUp from 'next/image';
import ArrowDown from 'next/image';

interface props {
 clothing: dataGetClothingCart[] | null | undefined;
 retryPaymentData: getOrderDetailResponse | null;
 totalPrice: string;
 freight: string | null;
 responseError: string | null;
 totalPriceWithFreight: string | null;
 setTotalPriceWithFreight: Dispatch<SetStateAction<string | null>>;
 setPrivacy: Dispatch<SetStateAction<boolean>>;
 privacyError: string | null;
 recaptchaError: string | null;
}

export default function Products({
 clothing,
 totalPrice,
 freight,
 responseError,
 retryPaymentData,
 setTotalPriceWithFreight,
 recaptchaError,
 privacyError,
 setPrivacy,
}: props) {
 const [products, setProducts] = useState<boolean>(true);
 const errorRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
  if (freight == null) {
   setTotalPriceWithFreight(null);
   return;
  }
  let val: string | null = freight;
  let val2: string | null = totalPrice;

  if (freight?.includes(',')) {
   val = freight.replace(',', '.');
  }
  if (totalPrice.includes(',')) {
   val2 = totalPrice.replace(',', '.');
  }
  if (Number(totalPrice) >= 200) {
   setTotalPriceWithFreight(formatPrice(Number(totalPrice)));
   return;
  }
  const total = Math.round((Number(val2) + Number(val)) * 100) / 100;
  if (!isNaN(total)) {
   setTotalPriceWithFreight(formatPrice(total));
   return;
  }

  setTotalPriceWithFreight(null);
 }, [freight]);

 useEffect(() => {
  if (responseError) {
   errorRef.current?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
   });
  }
 }, [responseError]);

 return (
  <>
   <section className={`${styles.section}`}>
    <div style={{ display: 'flex' }}>
     {products ? (
      <button
       className={styles.arrow}
       id="arrowProducts"
       type="button"
       onClick={() => setProducts((a) => !a)}
       aria-label="diminuir sessão de roupas"
      >
       <ArrowUp
        src="/img/arrowUp.png"
        alt="seta para cima"
        width={24}
        height={24}
       />
      </button>
     ) : (
      <button
       className={styles.arrow}
       id="arrowProducts"
       type="button"
       onClick={() => setProducts((a) => !a)}
       aria-label="expandir sessão de roupas"
      >
       <ArrowDown
        src="/img/arrowDown.png"
        alt="seta para baixo"
        width={24}
        height={24}
       />
      </button>
     )}
     <label htmlFor="arrowProducts" className={styles.label}>
      Roupa(s)
     </label>
    </div>
    {products && (
     <div className={styles.products}>
      {clothing?.map((infos) => {
       return (
        <div
         className={`${styles.clothing}`}
         key={infos.roupa_id + infos.cor + infos.tamanho}
        >
         <ClothingImg
          src={infos.imagem}
          alt={infos.alt}
          width={80}
          height={85}
          className={`${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}
         />
         <div className={`${styles.values}`}>
          <p className={styles.field}>Nome: </p>
          <p className={styles.value}>{infos.nome}</p>
         </div>
         <div
          className={`${styles.values} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.field}>Cor: </p>
          <p className={styles.value}>{infos.cor}</p>
         </div>
         <div className={`${styles.values}`}>
          <p className={styles.field}>Tamanho: </p>
          <p className={styles.value}>{infos.tamanho.toUpperCase()}</p>
         </div>
         <div
          className={`${styles.values} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.field}>Quantidade: </p>
          <p className={styles.value}>{infos.quantidade}</p>
         </div>
         <div
          className={`${styles.values} ${styles.clothingPrice} ${(infos.excedeEstoque || !infos.disponivel) && styles.lowOpacity}`}
         >
          <p className={styles.field}>Preço: </p>
          <p className={`${styles.value}`}>R${formatPrice(infos.preco)}</p>
         </div>
         <div className={`${styles.values}`}>
          {(infos.excedeEstoque || !infos.disponivel) && (
           <p className={styles.alert}>
            {!infos.disponivel
             ? `roupa indisponível`
             : `quantidade pedida indisponível,quantidade disponível: ${infos.quantidadeDisponivel}`}
           </p>
          )}
         </div>
        </div>
       );
      })}
      {retryPaymentData?.data &&
       typeof retryPaymentData?.data == 'object' &&
       'pedido' in retryPaymentData.data &&
       retryPaymentData.data.pedido.pacotes.map(({ ...packages }) =>
        packages.roupa.map(({ ...infos }) => {
         return (
          <div
           className={`${styles.clothing}`}
           key={infos.id + infos.cor + infos.tamanho}
          >
           <ClothingImg
            src={infos.imagem}
            alt={infos.alt}
            width={80}
            height={85}
           />
           <div className={`${styles.values}`}>
            <p className={styles.field}>Nome: </p>
            <p className={styles.value}>{infos.nome}</p>
           </div>
           <div className={`${styles.values}`}>
            <p className={styles.field}>Cor: </p>
            <p className={styles.value}>{infos.cor}</p>
           </div>
           <div className={`${styles.values}`}>
            <p className={styles.field}>Tamanho: </p>
            <p className={styles.value}>{infos.tamanho.toUpperCase()}</p>
           </div>
           <div className={`${styles.values}`}>
            <p className={styles.field}>Quantidade: </p>
            <p className={styles.value}>{infos.quantidade}</p>
           </div>
           <div className={`${styles.values} ${styles.clothingPrice}`}>
            <p className={styles.field}>Preço: </p>
            <p className={`${styles.value}`}>R${formatPrice(infos.preco)}</p>
           </div>
          </div>
         );
        }),
       )}
     </div>
    )}
    <Recaptcha className={styles.recaptcha} classNameP={styles.recaptchaP} />
    {
     <p className={styles.error} ref={errorRef}>
      {responseError}
     </p>
    }
    <div className={styles.privacy}>
     <label htmlFor="privacy">
      Aceitar{' '}
      <Link href="/politica-privacidade-pagamento" target="_blank">
       política de privacidade
      </Link>
     </label>
     <input
      type="checkbox"
      id="privacy"
      onClick={() => setPrivacy((p) => !p)}
     />
    </div>
    {recaptchaError && (
     <p style={{ marginBottom: '15px' }} className={styles.error}>
      {recaptchaError}
     </p>
    )}
    {privacyError && (
     <p style={{ marginBottom: '15px' }} className={styles.error}>
      {privacyError}
     </p>
    )}
    <button
     style={{ marginLeft: '12px', marginTop: '0px' }}
     type="submit"
     className={styles.button}
    >
     Finalizar compra
    </button>
   </section>
  </>
 );
}
