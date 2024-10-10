'use client';

import {
 Dispatch,
 MutableRefObject,
 SetStateAction,
 useEffect,
 useRef,
 useState,
} from 'react';
import styles from './card.module.css';
import Back from '../back/back';
import Create3DSSession from '@/api/order/create3DSSession';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { card, enderecoContato } from '@/api/clothing/payOrderInterfaces';
import Visibility from 'next/image';

interface props {
 cookieName?: string;
 cookieVal?: string;
 setPaymentType: Dispatch<
  SetStateAction<
   'card' | 'credit_card' | 'debit_card' | 'pix' | 'boleto' | null
  >
 >;
 paymentType: 'card' | 'credit_card' | 'debit_card' | 'pix' | 'boleto' | null;
 setError: Dispatch<boolean>;
 setLoad: Dispatch<boolean>;
 showCard: boolean;
 load: boolean;
 setCard: Dispatch<card | null>;
 card: card | null;
 responseError: string | null;
 address: enderecoContato | null;
 addressRef: MutableRefObject<HTMLElement | null>;
 responseError3ds: string | null;
 setIdTo3ds: Dispatch<SetStateAction<string | null>>;
 price: number;
}

export interface request3DSData {
 data: request3DS;
}

interface request3DS {
 customer: customer;
 paymentMethod: paymentMethod;
 amount: amount;
 shippingAddress: shippingAddress;
 dataOnly: false;
}

interface shippingAddress {
 street: string;
 number: number;
 complement: string;
 city: string;
 regionCode: string;
 country: string;
 postalCode: string;
}

interface amount {
 value: number;
 currency: 'BRL';
}

interface customer {
 name: string;
 email: string;
 phones: phones[];
}

interface paymentMethod {
 type: string;
 installments: string;
 card: cardInterface;
}

interface cardInterface {
 number: number;
 expMonth: number;
 expYear: number;
 holder: holder;
}

interface holder {
 name: string;
}

interface phones {
 country: number;
 area: number;
 number: number;
 type: 'MOBILE';
}

const schema = z
 .object({
  cardNumber: z
   .string()
   .min(14, 'número de cartão inválido')
   .max(20, 'número de cartão inválido')
   .refine(
    (number) => {
     number = number.replaceAll('-', '').replaceAll(' ', '');
     if (isNaN(Number(number))) {
      return false;
     }
     let sum = 0;
     let sum_2 = 0;
     let double = true;
     for (let i = 0; i < number.length; i++) {
      if (double) {
       const n = String(Number(number[i]) * 2);
       for (let j = 0; j < n.length; j++) {
        sum += Number(n[j]);
       }
       double = false;
      } else {
       sum_2 += Number(number[i]);
       double = true;
      }
     }
     return (sum + sum_2) % 10 === 0;
    },
    {
     message: 'número de cartão inválido',
    },
   ),
  holder: z
   .string()
   .min(1, 'titular do cartão inválido')
   .max(100, 'titular do cartão inválido')
   .regex(/^\p{L}+['.-]?(?:\s+\p{L}+['.-]?)+$/u, {
    message: 'titular do cartão inválido',
   }),
  cvv: z.string().min(3, 'cvv inválido').max(4, 'cvv inválido'),
  expMonth: z.string(),
  expYear: z.string(),
  installments: z.string().default('1'),
 })
 .refine(
  (field) => {
   const expiryDate = new Date(
    Number(field.expYear),
    Number(field.expMonth),
    0,
   );
   const now = new Date();
   return expiryDate >= now;
  },
  {
   message: 'este cartão está expirado',
   path: ['expYear'],
  },
 );

type FormProps = z.infer<typeof schema>;

export default function Card({
 setPaymentType,
 paymentType,
 showCard,
 setError,
 setLoad,
 cookieName,
 cookieVal,
 load,
 setCard,
 card,
 responseError,
 responseError3ds,
 setIdTo3ds,
 price,
}: props) {
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onBlur',
  reValidateMode: 'onBlur',
  resolver: zodResolver(schema),
 });
 const router = useRouter();
 const [next, setNext] = useState<boolean>(false);
 const [saved, setSaved] = useState<boolean>(false);
 const [visibility, setVisibility] = useState<boolean>(false);
 const [idTo3dsExpiration, setIdTo3dsExpiration] = useState<number | null>(
  null,
 );

 const formRef = useRef<HTMLFormElement | null>(null);

 useEffect(() => {
  if (paymentType == 'debit_card' || paymentType == 'credit_card') {
    const pagbank_script = document.querySelector('#pagbank_script');
    if (!(pagbank_script instanceof HTMLScriptElement)) {
     const script = document.createElement('script');
     script.src =
      'https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js';
     script.id = 'pagbank_script';
     document.body.append(script);
    }
  }
  if (paymentType == 'debit_card') {
   (async function () {
    setError(false);
    if (cookieName == undefined || cookieVal == undefined) {
     router.push('/auth/entrar');
     return;
    }
    const cookie = cookieName + '=' + cookieVal;
    if (idTo3dsExpiration != null) {
     const now = Date.now();
     if (now < idTo3dsExpiration) {
      setNext(true);
      return;
     }
    }
    setLoad(true);
    const data = await Create3DSSession(cookie);

    if (data == 'contato não verificado') {
     router.push('/auth/validar-contato');
     return;
    }
    if (data == 'cookie inválido') {
     router.push('/auth/entrar');
     return;
    }
    if (data == 500) {
     setLoad(false);
     setError(true);
     setPaymentType('card');
     return;
    }
    setIdTo3ds(data.session);
    setIdTo3dsExpiration(data.expires_at);
    setLoad(false);
    setNext(true);
   })();
  } else if (paymentType == 'credit_card') {
   setError(false);
   setNext(true);
  }
 }, [paymentType]);

 useEffect(() => {
  if (responseError3ds) {
   formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
   setSaved(false);
  }
 }, [responseError3ds]);

 async function handleForm(data: FormProps) {
  data.cardNumber = data.cardNumber.replaceAll('-', '').replaceAll(' ', '');
  const expMonth = Number(data.expMonth);
  const installments = Number(data.installments);
  if (!isNaN(expMonth) && !isNaN(installments)) {
    /*@ts-ignore*/
  const encryptedCard = PagSeguro.encryptCard({
    publicKey: process.env.NEXT_PUBLIC_PAGBANK_KEY,
    holder: data.holder,
    number: data.cardNumber,
    expMonth: expMonth,
    expYear: data.expYear,
    securityCode: data.cvv
  });
  if (encryptedCard.hasErrors) {
    setError(true)
    return
  }
  if(encryptedCard.errors.length >= 1) {
    setError(true)
    return
  }
  
   setCard({
    encriptado: encryptedCard.encryptedCard,
    nome: data.holder,
    numeroCartao: data.cardNumber.replace(/\s+/g, ''),
    cvv: data.cvv,
    expAno: data.expYear,
    expMes: expMonth,
    parcelas: installments,
    id3DS: null,
   });
   setSaved(true);
  } else {
   setError(true);
  }
 }

 return !next ? (
  <div className={`${styles.selectCard} ${!showCard && styles.displayNone}`}>
   <Back
    handleBack={() => setPaymentType(null)}
    ariaLabel="Voltar para formas de pagamento"
   />
   <p className={styles.p}>Tipo de cartão</p>
   <button
    disabled={load}
    type="button"
    className={styles.button}
    onClick={() => setPaymentType('debit_card')}
   >
    Débito
   </button>
   <button
    disabled={load}
    type="button"
    className={styles.button}
    onClick={() => setPaymentType('credit_card')}
   >
    Crédito
   </button>
  </div>
 ) : !saved ? (
  <form
   className={`${styles.form} ${!showCard && styles.displayNone}`}
   onSubmit={handleSubmit(handleForm)}
   ref={formRef}
  >
   <Back
    handleBack={() => {
     setNext(false);
     setLoad(false);
     setPaymentType('card');
    }}
    ariaLabel="Voltar para tipo de cartão"
   />
   <label className={styles.label} htmlFor="cardNumber">
    Número do cartão
   </label>
   <input
    {...register('cardNumber')}
    type="text"
    placeholder="número do cartão"
    id="cardNumber"
   />
   {errors.cardNumber && (
    <p className={styles.error}>{errors.cardNumber.message}</p>
   )}
   <label className={styles.label} htmlFor="holder">
    Nome do titular
   </label>
   <input
    {...register('holder')}
    type="text"
    placeholder="titular do cartão"
    id="holder"
   />
   {errors.holder && <p className={styles.error}>{errors.holder.message}</p>}
   <label className={styles.label} htmlFor="cvv">
    Cvv
   </label>
   <input
    {...register('cvv')}
    type="number"
    placeholder="código do cartão"
    id="cvv"
   />
   {errors.cvv && <p className={styles.error}>{errors.cvv.message}</p>}
   <label className={`${styles.label}`} htmlFor="expMonth">
    Mês de expiração
   </label>
   <select id="expMonth" {...register('expMonth')}>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
    <option value="10">10</option>
    <option value="11">11</option>
    <option value="12">12</option>
   </select>
   <label className={`${styles.label}`} htmlFor="expYear">
    Ano de expiração
   </label>
   <select id="expYear" {...register('expYear')}>
    <option value="2024">2024</option>
    <option value="2025">2025</option>
    <option value="2026">2026</option>
    <option value="2027">2027</option>
    <option value="2028">2028</option>
    <option value="2029">2029</option>
    <option value="2030">2030</option>
    <option value="2031">2031</option>
    <option value="2032">2032</option>
    <option value="2033">2033</option>
    <option value="2034">2034</option>
    <option value="2035">2040</option>
   </select>
   {errors.expYear && <p className={styles.error}>{errors.expYear.message}</p>}
   {paymentType == 'credit_card' && price >= 200 && (
    <>
     <label
      className={`${styles.label}`}
      htmlFor="installments"
      {...register('installments')}
     >
      Parcelas
     </label>
     <select id="installments" {...register('installments')}>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
     </select>
    </>
   )}
   {responseError3ds && <p className={styles.error}>{responseError3ds}</p>}
   <button className={styles.button} type="submit" id="submit">
    Salvar dados do cartão
   </button>
  </form>
 ) : (
  card && (
   <div
    className={`${!showCard && styles.displayNone}`}
    style={{ display: 'grid' }}
   >
    <div className={styles.values}>
     <p className={styles.field}>Número cartão: </p>
     <p className={styles.value}>
      **** **** **** {card.numeroCartao.substring(12)}
     </p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Nome do titular: </p>
     <p className={styles.value}>{card.nome}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Cvv: </p>
     <div className={styles.visibility}>
      <p className={styles.value}>{!visibility ? '***' : `${card.cvv}`}</p>
      <button aria-label={visibility ? 'ocultar cvv' : 'mostrar cvv'}>
       {visibility ? (
        <Visibility
         src="/img/visibilityOn.png"
         alt="ocultar cvv"
         width={21}
         height={15}
         onClick={() => setVisibility(false)}
        />
       ) : (
        <Visibility
         src="/img/visibilityOff.png"
         alt="mostrar cvv"
         width={22}
         height={20}
         onClick={() => setVisibility(true)}
        />
       )}
      </button>
     </div>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Mês de expiração: </p>
     <p className={styles.value}>{card.expMes}</p>
    </div>
    <div className={styles.values}>
     <p className={styles.field}>Ano de expiração: </p>
     <p className={styles.value}>{card.expAno}</p>
    </div>
    {paymentType == 'credit_card' && (
     <div className={styles.values}>
      <p className={styles.field}>Parcelas: </p>
      <p className={styles.value}>{card.parcelas}</p>
     </div>
    )}
    {(paymentType == 'credit_card' || paymentType == 'debit_card') &&
     responseError && (
      <p
       className={styles.error}
       style={{ marginLeft: '12px', wordBreak: 'break-all' }}
      >
       {responseError}
      </p>
     )}
    <button
     className={styles.button}
     onClick={() => {
      setSaved(false);
      setCard(null);
     }}
     style={{ marginLeft: '12px' }}
    >
     Editar dados do cartão
    </button>
   </div>
  )
 );
}
