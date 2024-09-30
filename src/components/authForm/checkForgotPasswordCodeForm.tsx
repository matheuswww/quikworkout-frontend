'use client';
import Link from 'next/link';
import styles from './validateCodeForm.module.css';
import { SyntheticEvent, useEffect, useState } from 'react';
import { setInterval } from 'timers';
import PopupError from '../popupError/popupError';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SpinLoading from '../spinLoading/spinLoading';
import CheckForgotPasswordCode, {
 checkForgotPasswordCodeResponse,
} from '@/api/auth/checkForgotPasswordCode';
import { deleteCookie } from '@/action/deleteCookie';
import Recaptcha from '../recaptcha/recaptcha';
import RecaptchaForm from '@/funcs/recaptchaForm';

const schema = z.object({
 code: z
  .string()
  .min(6, 'o código deve conter 6 caracteres')
  .max(6, 'o código deve conter 6 caracteres'),
});

type FormProps = z.infer<typeof schema>;

export default function CheckForgotPasswordCodeForm() {
 const [timer, setTimer] = useState<number>(0);
 const [load, setLoad] = useState<boolean>(false);
 const [error, setError] = useState<checkForgotPasswordCodeResponse | null>(
  null,
 );
 const [popUpError, setPopUpError] = useState<boolean>(false);
 const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
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
  setPopUpError(false);
  setRecaptchaError(null);
  setError(null);
  const token = RecaptchaForm(setRecaptchaError);
  if (token == '') {
   return;
  }
  setLoad(true);
  const res = await CheckForgotPasswordCode({
   codigo: data.code,
   token: token,
  });
  if (res == 'recaptcha inválido') {
   setRecaptchaError('preencha o recaptcha novamente');
   setLoad(false);
   //@ts-ignore
   window.grecaptcha.reset();
   return;
  }
  if (
   res == 'você não possui um código registrado' ||
   res == 'código expirado'
  ) {
   await deleteCookie('userAuthResetPass');
   window.location.href = '/auth/esqueci-minha-senha';
   return;
  }
  if (res == 'usuário já possui autenticação de dois fatores') {
   localStorage.removeItem('timeSendForgotPasswordCode');
   window.location.href = '/';
   return;
  }
  if (res == 'código valido porém não foi possivel criar uma sessão') {
   await deleteCookie('userAuthResetPass');
   localStorage.removeItem('timeSendForgotPasswordCode');
   window.location.href = '/auth/entrar';
   return;
  }
  if (res == 401) {
   await deleteCookie('userAuthResetPass');
   localStorage.removeItem('timeSendForgotPasswordCode');
   window.location.href = '/auth/esqueci-minha-senha';
   return;
  } else if (res != 200) {
   if (typeof res == 'string') {
    setError(res);
   } else if (res == 500) {
    setPopUpError(true);
   }
   setLoad(false);
  } else {
   localStorage.removeItem('timeSendForgotPasswordCode');
   localStorage.setItem('timeResetPassword', new Date().getTime().toString());
   window.location.href = '/auth/resetar-senha';
   return;
  }
 }

 function handleClick(event: SyntheticEvent) {
  event.preventDefault();
  if (timer >= 60) {
   const newUrl = window.location.pathname;
   window.history.replaceState(null, '', newUrl);
   window.location.reload();
  }
 }

 useEffect(() => {
  const prevTime = Number(localStorage.getItem('timeSendForgotPasswordCode'));
  const currentTIme = new Date().getTime();
  let elapsedTime: number = 0;
  if (prevTime) {
   elapsedTime = Math.round(Math.abs(currentTIme - prevTime) / 1000);
   if (elapsedTime > 60 * 6) {
    localStorage.removeItem('timeSendForgotPasswordCode');
    window.location.href = '/auth/esqueci-minha-senha';
   }
  } else {
   elapsedTime = 60;
  }
  setTimer(elapsedTime);
  const interval = setInterval(() => {
   setTimer((t) => t + 1);
   if (timer >= 60) {
    clearInterval(interval);
   }
  }, 1000);
 }, []);

 return (
  <>
   {popUpError && <PopupError handleOut={() => setPopUpError(false)} />}
   {load && <SpinLoading />}
   <main className={`${styles.main} ${load && styles.lowOpacity}`}>
    <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
     <h1>Verifique seu email</h1>
     <input
      {...register('code')}
      type="number"
      placeholder="insira seu código"
     />
     {errors.code?.message ? (
      <p className={styles.error}>{errors.code.message}</p>
     ) : (
      error && <p className={styles.error}>{error}</p>
     )}
     {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
     <Link onClick={handleClick} href="/auth/esqueci-minha-senha">
      {timer <= 60
       ? `Não chegou? Aguarde 1 minuto para pedir outro código ${timer}`
       : 'Enviar outro código'}
     </Link>
     <Recaptcha className={styles.recaptcha} />
     <button
      disabled={load ? true : false}
      type="submit"
      className={`${load && styles.loading}`}
     >
      {load ? 'Carregando...' : 'Enviar código'}
     </button>
    </form>
   </main>
  </>
 );
}
