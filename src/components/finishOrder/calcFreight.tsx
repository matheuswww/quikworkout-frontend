'use client';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import styles from './calcFreight.module.css';
import { dataGetClothingCart } from '@/api/clothing/getClothingCart';
import CalcFreight, { calcFreightData } from '@/api/clothing/calcFreight';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowUp from 'next/image';
import ArrowDown from 'next/image';
import formatPrice from '@/funcs/formatPrice';
import { enderecoContato } from '@/api/clothing/payOrderInterfaces';

interface props {
 address: enderecoContato | null
 setCalcFreightData: Dispatch<SetStateAction<calcFreightData[] | 'error' | null>>;
 clothing: dataGetClothingCart[] | null | undefined;
 end: boolean;
 load: boolean;
 setLoad: Dispatch<boolean>;
 setPopupError: Dispatch<SetStateAction<boolean>>;
 totalPrice: number;
}

const schema = z
 .object({
  cep: z.string().min(8, 'cep inválido').max(9, 'cep inválido'),
 })
 .refine(
  (fields) => {
   let cepNumber = fields.cep;
   if (fields.cep.includes('-')) {
    cepNumber = fields.cep.replace('-', '');
   }

   if (isNaN(Number(cepNumber))) {
    return false;
   }
   return true;
  },
  {
   path: ['cep'],
   message: 'cep inválido',
  },
 );

type FormProps = z.infer<typeof schema>;

export default function CalcFreightForm({
 end,
 load,
 setLoad,
 setPopupError,
 clothing,
 totalPrice,
 setCalcFreightData,
 address,
}: props) {
 const {
  register,
  handleSubmit,
  formState: { errors },
  setValue,
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });

 const [calcFreight, setCalcFreight] = useState<boolean>(true);
 const [data, setData] = useState<calcFreightData[] | null>(null);
 const [error, setError] = useState<string | null>(null);

 const button = useRef<HTMLButtonElement | null>(null);

 useEffect(() => {
  const input = document.querySelector("input");
  if (button.current && input && address) {
    input.value = address.cep;
    setValue('cep', address.cep);
    button.current.click();
  }
 }, [address]);

 async function handleForm(values: FormProps) {
  if (end) {
   setError(null);
   setPopupError(false);
   setLoad(true);
   const clothingIds: string[] = [];
   const productQuantity: number[] = [];
   if (clothing) {
    clothing.map(({ roupa_id, quantidade }) => {
     clothingIds.push(roupa_id);
     productQuantity.push(quantidade);
    });
   }
   if (clothing) {
    if (values.cep.includes('-')) {
     values.cep = values.cep.replace('-', '');
    }
    if (values.cep.length >= 9) {
     setLoad(false);
     setError('cep inválido');
     return;
    }
    const res = await CalcFreight({
     cep: values.cep,
     quantidadeProduto: productQuantity,
     roupa: clothingIds
    });
    if (res.status == 500) {
     setPopupError(true);
     setLoad(false);
     if(address && address.cep == values.cep) {
      setCalcFreightData('error');
     }
     return;
    }
    if (res.data == 'frete não disponível') {
     setError('frete não disponível para este endereço e tipo de entrega');
     setLoad(false);
     return;
    }
    
    if (res.data && res.data instanceof Array) {
     setData(res.data);
     
     if(address && address.cep == values.cep) {
      setCalcFreightData(res.data);
     }
    }
    setLoad(false);
   }
  }
 }

 return (
  <section className={styles.section}>
   <div style={{ display: 'flex' }}>
    {calcFreight ? (
     <button
      className={styles.arrow}
      id="arrowCalcFreight"
      onClick={() => setCalcFreight((a) => !a)}
      aria-label="diminuir sessão de cálculo de frete"
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
      id="arrowCalcFreight"
      onClick={() => setCalcFreight((a) => !a)}
      aria-label="expandir sessão de cálculo de frete"
     >
      <ArrowDown
       src="/img/arrowDown.png"
       alt="seta para baixo"
       width={24}
       height={24}
      />
     </button>
    )}
    <label className={styles.label} htmlFor="arrowCalcFreight">
     Cálculo de frete
    </label>
   </div>
   {calcFreight && (
    <>
     <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
      <label htmlFor="cep">Digite seu cep</label>
      <input
       {...register('cep')}
       type="text"
       id="cep"
       className={styles.cep}
       placeholder="digite seu cep aqui"
      />
      {error ? (
       <p className={styles.error}>{error}</p>
      ) : (
       errors.cep && <p className={styles.error}>{errors.cep.message}</p>
      )}
      {data && data.map((f, i) => (
        <React.Fragment key={f.transp_nome}>
          {f?.vlrFrete && (
            <>
              <p className={styles.price}>Entrega {f.transp_nome}:</p>
              <p className={styles.price}>
                {totalPrice < 300
                ? `Frete: R$${formatPrice(f.vlrFrete)}`
                : 'Frete grátis'}
              </p>
            </>
          )}
          {f?.prazoEnt && (
            <p className={styles.price}>
              Prazo de entrega: {f?.prazoEnt} dias úteis
            </p>
          )}
          {i === 0 && <span className={styles.padding}></span>}
        </React.Fragment>
      ))}
      <button disabled={load} className={`${styles.calcFreight}`} ref={button}>
       Calcular frete
      </button>
     </form>
    </>
   )}
  </section>
 );
}