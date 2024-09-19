'use client';
import { useEffect, useState } from 'react';
import Password from './password';
import styles from './sendCreateTwoAuthCodeForm.module.css';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SendCreateTwoAuthCode from '@/api/auth/sendCreateTwoAuthCode';
import SpinLoading from '../spinLoading/spinLoading';
import PopupError from '../popupError/popupError';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/action/deleteCookie';
import CheckCreateTwoAuthCodeForm from './checkCreateTwoAuthCodeForm';
import GetUser from '@/api/user/getUser';
import { ValidateEmail } from '@/funcs/validateEmail';
import Recaptcha from '../recaptcha/recaptcha';
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
   .min(8, 'senha precisa ter pelo menos 8 caracteres')
   .max(72, 'A senha deve ter no maxímo de 72 caracteres'),
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

export default function SendCreateTwoAuthCodeForm({ ...props }: props) {
 const router = useRouter();
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
  if (props.cookieName == undefined || props.cookieVal == undefined) {
   router.push('/auth/entrar');
  } else {
   if (props.cookieName == undefined || props.cookieVal == undefined) {
    router.push('/auth/entrar');
   } else {
    (async function () {
     const res = await GetUser(cookie);
     if (
      res.data &&
      'twoAuthEmail' in res.data &&
      res.data.twoAuthEmail != ''
     ) {
      setLoad(true);
      router.push('/');
     } else if (!res.data?.verificado) {
      router.push('/auth/validar-contato');
     } else {
      if (res.status == 404 || res.status == 401) {
       await deleteCookie('userProfile');
       router.push('/auth/entrar');
      } else {
       setLoad(false);
      }
     }
    })();
   }
  }
 }, []);

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
  const res = await SendCreateTwoAuthCode(cookie, {
   email: data.email,
   senha: data.password,
   token: token,
  });
  if (res == 'recaptcha inválido') {
   setRecaptchaError(res);
   //@ts-ignore
   window.grecaptcha.reset();
  }
  if (res == 'seu código foi gerado porem não foi possivel criar uma sessão') {
   router.push('/auth/entrar');
  }
  if (res == 500) {
   setPopUpError(true);
  } else if (
   res == 'contato já utilizado para autenticação' ||
   res == 'este email já é utilizado para sua autenticação'
  ) {
   if (res == 'contato já utilizado para autenticação') {
    setError('email já utilizado para autenticação');
   } else {
    setError(res);
   }
  } else if (res == 'senha errada') {
   setError('senha inválida');
  } else if (res == 'usuário já possui autenticação de dois fatores') {
   router.push('/');
  } else if (res == 'usuário não é verificado') {
   router.push('/auth/validar-contato');
  } else if (res == 401) {
   await deleteCookie('userProfile');
   router.push('/auth/entrar');
  } else if (res == 200) {
   localStorage.setItem(
    'timeSendCreateTwoAuthCode',
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
        <h1>Criar autenticação de dois fatores</h1>
        <label htmlFor="email">E-mail para envio do código de autenticação</label>
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
        {errors.password?.message ? (
         <p className={styles.error}>{errors.password.message}</p>
        ) : (
         error == 'senha inválida' && <p className={styles.error}>{error}</p>
        )}
        {recaptchaError && <p className={styles.error}>{recaptchaError}</p>}
        {error && error != 'senha inválida' && (
         <p className={styles.error}>{error}</p>
        )}
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
    <CheckCreateTwoAuthCodeForm cookie={cookie} />
   )}
  </>
 );
}
