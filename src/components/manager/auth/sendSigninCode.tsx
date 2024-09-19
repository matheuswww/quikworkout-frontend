'use client';

import Password from '@/components/authForm/password';
import styles from './sendSigninCode.module.css';
import PopupError from '@/components/popupError/popupError';
import SpinLoading from '@/components/spinLoading/spinLoading';
import { ValidateEmail } from '@/funcs/validateEmail';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import SendSigninCode from '@/api/manager/auth/sendSigninCode';
import CheckSigninCodeForm from './checkSigninCode';
import Recaptcha from '@/components/recaptcha/recaptcha';
import RecaptchaForm from '@/funcs/recaptchaForm';

interface props {
 cookieName: string | undefined;
 cookieVal: string | undefined;
}

const schema = z
 .object({
  email: z.string(),
  password: z
   .string()
   .min(4, 'senha precisa ter pelo menos 8 caracteres')
   .max(72, 'A senha deve ter no maxímo de 72 caracteres'),
 })
 .refine(
  (fields) => {
   return ValidateEmail(fields.email);
  },
  {
   path: ['email'],
   message: 'email ou telefone inválido',
  },
 );

type FormProps = z.infer<typeof schema>;

export default function SendSigninCodeForm({ ...props }: props) {
 const cookie = props.cookieName + '=' + props.cookieVal;
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
   }
  } else {
   setLoad(false);
  }
 }, [next]);

 async function handleForm(data: FormProps) {
  setRecaptchaError(null);
  setError(null);
  const token = RecaptchaForm(setRecaptchaError);
  if (token == '') {
   return;
  }
  setLoad(true);
  const res = await SendSigninCode({
   email: data.email,
   senha: data.password,
   token: token,
  });
  if (res == 200) {
   localStorage.setItem('timeSendSigninCode', new Date().getTime().toString());
   setNext(true);
   return;
  }
  if (res == 'recaptcha inválido') {
   setRecaptchaError(res);
   //@ts-ignore
   window.grecaptcha.reset();
  }
  if (
   res == 500 ||
   res == 'código gerado porém não foi possivel gerar sua sessão'
  ) {
   setPopUpError(true);
  }
  if (res == 'email ou senha incorretos') {
   setError(res);
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
        <h1>Entrar</h1>
        <label htmlFor="email">E-mail</label>
        <input
         {...register('email')}
         type="text"
         id="email"
         placeholder="email"
         max={255}
        />
        {errors.email?.message && (
         <p className={styles.error}>{errors.email.message}</p>
        )}
        <label htmlFor="password">Sua senha</label>
        <Password {...register('password')} id="password" placeholder="senha" />
        {error && !errors.email?.message && (
         <p className={styles.error}>{error}</p>
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
    <CheckSigninCodeForm cookie={cookie} />
   )}
  </>
 );
}
