'use client';
import { useEffect, useState } from 'react';
import styles from './sendForgotPasswordCodeForm.module.css';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SpinLoading from '../spinLoading/spinLoading';
import PopupError from '../popupError/popupError';
import SendForgotPasswordCode from '@/api/auth/forgotPassword';
import CheckForgotPasswordCodeForm from './checkForgotPasswordCodeForm';
import { ValidateEmail } from '@/funcs/validateEmail';
import Recaptcha from '../recaptcha/recaptcha';
import RecaptchaForm from '@/funcs/recaptchaForm';

const schema = z
 .object({
  email: z.string(),
 })
 .refine(
  (fields) => {
   return ValidateEmail(fields.email);
  },
  {
   path: ['email'],
   message: 'email inválido',
  },
 );

type FormProps = z.infer<typeof schema>;

export default function SendForgotPasswordCodeForm() {
 const [error, setError] = useState<string | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [popUpError, setPopUpError] = useState<boolean>(false);
 const [next, setNext] = useState<boolean>(false);
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

 useEffect(() => {
  if (next) {
   const currentURL = window.location.href;
   const URLObj = new URL(currentURL);
   URLObj.searchParams.set('sended', 'true');
   const newURL = URLObj.toString();
   window.history.pushState(null, '', newURL);
  }
  const searchParams = new URLSearchParams(window.location.search);
  const searched = searchParams.get('sended');
  if (searched == 'true') {
   if (!next) {
    setNext(true);
    return;
   }
  }
  setLoad(false);
 }, [next]);

 async function handleForm(data: FormProps) {
  setError(null);
  setRecaptchaError(null);
  const token = RecaptchaForm(setRecaptchaError);
  if (token == '') {
   return;
  }
  setLoad(true);
  const res = await SendForgotPasswordCode({
   email: data.email,
   token: token,
  });
  if (res == 'recaptcha inválido') {
   setRecaptchaError('preencha o recaptcha novamente');
   //@ts-ignore
   window.grecaptcha.reset();
  }
  if (res == 'seu código foi gerado porem não foi possivel criar uma sessão') {
   setPopUpError(true);
  }
  if (res == 500) {
   setPopUpError(true);
  } else if (res == 'usuário não encontrado') {
   setError('email não encontrado');
  } else if (res == 200) {
   localStorage.setItem(
    'timeSendForgotPasswordCode',
    new Date().getTime().toString(),
   );
   setNext(true);
   return;
  }
  setLoad(false);
 }

 return (
  <>
   {!next ? (
    <>
     {load && <SpinLoading />}
     {popUpError && <PopupError handleOut={() => setPopUpError(false)} />}
     <main className={`${styles.main} ${load && styles.load}`}>
      <section className={styles.section}>
       <form className={styles.form} onSubmit={handleSubmit(handleForm)}>
        <h1>
         Insira seu email para enviarmos um código de redefinição de senha
        </h1>
        <label htmlFor="email">E-mail</label>
        <input
         {...register('email')}
         type="text"
         id="email"
         placeholder="email"
         max={255}
        />
        {errors.email?.message ? (
         <p className={styles.error}>{errors.email.message}</p>
        ) : (
         error && <p className={styles.error}>{error}</p>
        )}
        {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
        <Recaptcha className={styles.recaptcha} />
        <button
         disabled={load ? true : false}
         className={`${load && styles.loading} ${styles.button}`}
         type="submit"
        >
         {load ? 'Carregando...' : 'Enviar código'}
        </button>
       </form>
      </section>
     </main>
    </>
   ) : (
    <CheckForgotPasswordCodeForm />
   )}
  </>
 );
}
