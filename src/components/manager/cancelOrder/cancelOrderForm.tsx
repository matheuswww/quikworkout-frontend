'use client';

import React, { SyntheticEvent, useState } from 'react';
import styles from './cancelOrder.module.css';
import GetOrder, { getOrderAdmin } from '@/api/manager/clothing/getOrder';
import PopupError from '@/components/popupError/popupError';
import SpinLoading from '@/components/spinLoading/spinLoading';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import handleArrowClick from '@/funcs/handleArrowClick';
import Expand from 'next/image';
import Image from 'next/image';
import formatPrice from '@/funcs/formatPrice';
import CancelPayment from '@/api/manager/profile/cancelPayment';
import CancelShippingForm from './cancelShipping';
import Menu from '../menu/menu';

const schema = z.object({
 id: z.string().min(41, 'id inválido').max(41, 'id inválido'),
});

type FormProps = z.infer<typeof schema>;

interface props {
 cookieName?: string;
 cookieVal?: string;
}

export default function CancelOrderForm({ cookieName, cookieVal }: props) {
 const router = useRouter();
 const [data, setData] = useState<getOrderAdmin | null>(null);
 const [load, setLoad] = useState<boolean>(false);
 const [popupError, setPopupError] = useState<boolean>(false);
 const [responseError, setResponseError] = useState<string | null>(null);
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });

 async function handleForm(data: FormProps) {
  setPopupError(false);
  setResponseError(null);
  if (cookieName == undefined || cookieVal == undefined) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  const cookie = cookieName + '=' + cookieVal;
  setLoad(true);
  const res = await GetOrder(cookie, undefined, undefined, data.id);
  if (res.status == 401) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  if (res.status == 404) {
   setResponseError('pedido não encontrado');
  }
  if (res.status == 500) {
   setPopupError(true);
  }
  setData(res);
  setLoad(false);
 }

 async function handleDeleteOrder(event: SyntheticEvent) {
  event.preventDefault();
  if (!data?.order?.pedido[0]) {
   return;
  }
  setPopupError(false);
  setLoad(true);
  if (cookieName == undefined || cookieVal == undefined) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  const cookie = cookieName + '=' + cookieVal;
  const res = await CancelPayment(cookie, {
   pedido_id: data.order.pedido[0].pedido_id,
   tipoPagamento: data.order.pedido[0].tipo_pagamento,
  });
  if (res == 401) {
   router.push('/manager-quikworkout/auth');
   return;
  }
  if (res == 500 || res == 404) {
   setPopupError(true);
  }
  if (res == 200) {
   setData((d) => {
    if (d?.order) {
     d.order.pedido[0].status_pagamento = 'cancelado';
    }
    return d;
   });
  }
  setLoad(false);
 }

 return (
  <>
   {load && <SpinLoading />}
   {popupError && <PopupError handleOut={() => setPopupError(false)} />}
   <Menu cookieName={cookieName} cookieVal={cookieVal} />
   <main className={`${styles.main} ${load && styles.opacity}`}>
    <section>
     <h1 className={styles.title}>Cancelar pedido</h1>
     <form className={`${styles.form}`} onSubmit={handleSubmit(handleForm)}>
      <label htmlFor="id">Pedido id</label>
      <input
       {...register('id')}
       type="text"
       id="id"
       placeholder="id do pedido"
      />
      {errors.id?.message ? (
       <p className={styles.error}>{errors.id.message}</p>
      ) : (
       responseError && <p className={styles.error}>{responseError}</p>
      )}
      <button className={styles.button}>Buscar</button>
     </form>
     {(data?.order?.pedido[0].status_pagamento == 'pago' ||
      data?.order?.pedido[0].status_pagamento == 'autorizado' ||
      data?.order?.pedido[0].status_pagamento == 'em análise' ||
      data?.order?.pedido[0].status_pagamento == 'aguardando') && (
      <form className={styles.form} onSubmit={handleDeleteOrder}>
       <button className={styles.button}>Cancelar pedido</button>
      </form>
     )}
     {data?.order?.pedido[0].cancelamento == '' &&
      data.order.pedido[0].status_pagamento == 'cancelado' && (
       <CancelShippingForm
        data={data}
        setData={setData}
        setLoad={setLoad}
        setPopupError={setPopupError}
        cookieName={cookieName}
        cookieVal={cookieVal}
       />
      )}
     {data?.order?.pedido.map(({ ...order }) => {
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
         <p>
          {order.tipo_pagamento == 'CREDIT_CARD' ||
          order.tipo_pagamento == 'DEBIT_CARD'
           ? 'cartão'
           : order.tipo_pagamento.toLocaleLowerCase()}
         </p>
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
         <p>{order.frete == 0 ? 'grátis' : formatPrice(order.frete)}</p>
        </div>
        {order.cancelamento && (
         <div className={`${styles.values}`}>
          <p>Motivo do cancelamento: </p>
          <p>{order.cancelamento}</p>
         </div>
        )}
        <div className={`${styles.values}`}>
         <p>Código de rastreio: </p>
         <p>
          {order.codigoRastreio == '' ? 'sem código' : order.codigoRastreio}
         </p>
        </div>
        <div className={`${styles.values}`}>
         <p>Preço total: </p>
         <p>R${formatPrice(order.precoTotal)}</p>
        </div>
        {order.pacotes.map(({ ...pacote }, j) => {
         const id = Math.floor(Math.random() * 1000000) + 1;
         return (
          <React.Fragment key={'vol' + j}>
           <div className={styles.volumesInfo}>
            <button
             className={styles.buttonExpand}
             onClick={() => handleArrowClick(id, 'volume', styles.displayNone)}
            >
             {order.pacotes.length > 1
              ? `Volume ${pacote.numeroPacote + 1}`
              : `Volume`}
            </button>
            <Expand
             src="/img/arrowUp.png"
             alt="expandir informações de volumes"
             width={30}
             height={30}
             className={`${styles.expand}`}
             onClick={() => handleArrowClick(id, 'volume', styles.displayNone)}
             id={`arrowUp_volume_${id}`}
            />
            <Expand
             src="/img/arrowDown.png"
             alt="diminuir informações de volumes"
             width={30}
             height={30}
             className={`${styles.expand} ${styles.displayNone}`}
             onClick={() => handleArrowClick(id, 'volume', styles.displayNone)}
             id={`arrowDown_volume_${id}`}
            />
           </div>
           <div
            className={`${styles.volumes} ${styles.displayNone}`}
            id={`item_volume_` + id}
           >
            <div className={styles.volume}>
             <div className={`${styles.values}`}>
              <p className={styles.field}>Número pacote: </p>
              <p className={styles.value}>{pacote.numeroPacote + 1}</p>
             </div>
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
             <button
              className={styles.buttonExpand}
              onClick={() =>
               handleArrowClick(id, 'clothing', styles.displayNone)
              }
             >
              Roupa(s)
             </button>
             <Expand
              src="/img/arrowUp.png"
              alt="expandir informações de roupa"
              width={30}
              height={30}
              className={`${styles.expand}`}
              onClick={() =>
               handleArrowClick(id, 'clothing', styles.displayNone)
              }
              id={`arrowUp_clothing_${id}`}
             />
             <Expand
              src="/img/arrowDown.png"
              alt="diminuir informações de roupa"
              width={30}
              height={30}
              className={`${styles.expand} ${styles.displayNone}`}
              onClick={() =>
               handleArrowClick(id, 'clothing', styles.displayNone)
              }
              id={`arrowDown_clothing_${id}`}
             />
            </div>
            <div
             key={`item_clothing_${id}`}
             id={`item_clothing_${id}`}
             className={`${styles.clothing} ${styles.displayNone}`}
            >
             {pacote.roupa.map(({ ...clothing }) => (
              <div key={clothing.id + clothing.tamanho + clothing.cor}>
               <Image
                src={clothing.imagem}
                alt={clothing.alt}
                width={80}
                height={85}
               />
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
             ))}
            </div>
           </div>
          </React.Fragment>
         );
        })}
       </div>
      );
     })}
    </section>
   </main>
  </>
 );
}
