import styles from './cancelOrder.module.css';
import { getOrderAdmin } from '@/api/manager/clothing/getOrder';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CancelShipping from '@/api/manager/profile/cancelShipping';

const schema = z.object({
 cancelationReason: z
  .string()
  .min(3, 'é necessário no minímo 3 caracteres')
  .max(255, 'é permitido no maxímo 255 caracteres'),
});

type FormProps = z.infer<typeof schema>;

interface props {
 setLoad: Dispatch<boolean>;
 setData: Dispatch<SetStateAction<getOrderAdmin | null>>;
 setPopupError: Dispatch<boolean>;
 cookieName?: string;
 cookieVal?: string;
 data: getOrderAdmin | null;
}

export default function CancelShippingForm({
 setData,
 setLoad,
 setPopupError,
 data,
 cookieName,
 cookieVal,
}: props) {
 const router = useRouter();
 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<FormProps>({
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  resolver: zodResolver(schema),
 });

 async function handleForm(dataForm: FormProps) {
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
  const res = await CancelShipping(cookie, {
   pedido_id: data?.order?.pedido[0].pedido_id,
   motivo: dataForm.cancelationReason,
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
     d.order.pedido[0].cancelamento = dataForm.cancelationReason;
    }
    return d;
   });
  }
  setLoad(false);
 }

 return (
  data?.order?.pedido[0].status_pagamento == 'cancelado' &&
  data.order.pedido[0].cancelamento == '' && (
   <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
    <label htmlFor="reason">Motivo do cancelamento</label>
    <input
     {...register('cancelationReason')}
     placeholder="motivo do cancelamento"
     id="reason"
    />
    {errors.cancelationReason?.message && (
     <p className={styles.error}>{errors.cancelationReason.message}</p>
    )}
    <button type="submit" className={styles.button}>
     Enviar
    </button>
   </form>
  )
 );
}
