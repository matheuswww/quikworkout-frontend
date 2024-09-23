'use client';

import Link from 'next/link';
import styles from './login.module.css';
import Password from './password';
import Background from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import SpinLoading from '../spinLoading/spinLoading';
import PopupError from '../popupError/popupError';
import Signin from '@/api/auth/signin';
import { ValidateEmail } from '@/funcs/validateEmail';
import Recaptcha from '../recaptcha/recaptcha';
import RecaptchaForm from '@/funcs/recaptchaForm';

const schema = z
 .object({
  email: z.string(),
  password: z.string(),
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

export default function SigninForm() {
 const [error, setError] = useState<string | null>(null);
 const [status, setStatus] = useState<number>(0);
 const [load, setLoad] = useState<boolean>(false);
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

 const handleForm = async (data: FormProps) => {
  setRecaptchaError(null);
  setError(null);
  let isNum: boolean = false;
  if (!isNaN(Number(data.email))) {
   isNum = true;
  }
  const token = RecaptchaForm(setRecaptchaError);
  if (token == '') {
   return;
  }
  setLoad(true);
  const res = await Signin({
   email: isNum ? '' : data.email,
   senha: data.password,
   token: token,
  });
  if (typeof res == 'object') {
   if (!res.twoAuth) {
    window.location.href = '/';
    return;
   }
   window.location.href = '/auth/validar-codigo-dois-fatores';
   return;
  }
  if (res == 'recaptcha inválido') {
   setRecaptchaError("preencha o recaptcha novamente");
   //@ts-ignore
   window.grecaptcha.reset();
  }
  if (res == 'contato não cadastrado' || res == 'senha errada') {
   if (res == 'contato não cadastrado') {
    setError('email não cadastrado');
   } else {
    setError(res);
   }
  }
  if (res == 500) {
   setStatus(status);
  }
  setLoad(false);
 };

 return (
  <>
   {load && <SpinLoading />}
   {status == 500 && (
    <PopupError handleOut={() => setStatus(0)} className={styles.popupError} />
   )}
   <main className={`${styles.main} ${load && styles.lowOpacity}`}>
    <div className={styles.containerBackground}>
     <Background
      src="/img/background-login.jpg"
      alt="mulher em um barra de crossfit executando um exercício"
      fill
      loading="lazy"
      quality={80}
      className={styles.background}
     />
    </div>
    <section className={styles.section}>
     <form
      className={`${styles.form} ${styles.formSignin}`}
      onSubmit={handleSubmit(handleForm)}
     >
      <h1>Entrar</h1>
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
       error == 'email não cadastrado' && (
        <p className={styles.error}>{error}</p>
       )
      )}
      <label htmlFor="password">Senha</label>
      <Password {...register('password')} id="password" placeholder="senha" />
      {error == 'senha errada' && (
       <p className={styles.error}>senha inválida</p>
      )}
      {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
      <Link href="/auth/esqueci-minha-senha" className={styles.forgotPassword}>
       Esqueceu sua senha?
      </Link>
      <Recaptcha className={styles.recaptcha} />
      <Link href="/auth/cadastrar">Não possui uma conta?</Link>
      <button
       disabled={load ? true : false}
       className={`${styles.login} ${load && styles.loading}`}
       type="submit"
      >
       {load ? 'Entrando, aguarde' : 'Entrar'}
      </button>
     </form>
    </section>
   </main>
  </>
 );
}
