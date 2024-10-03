'use client';
import { useEffect, useState } from 'react';
import Password from './password';
import styles from './sendRemoveTwoAuthCodeForm.module.css';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SpinLoading from '../spinLoading/spinLoading';
import PopupError from '../popupError/popupError';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/action/deleteCookie';
import GetUser from '@/api/user/getUser';
import SendRemoveTwoAuthCode from '@/api/auth/sendRemoveTwoAuthCode';
import CheckRemoveTwoAuthCodeForm from './checkRemoveTwoAuthCode';

interface props {
 cookieName: string | undefined;
 cookieVal: string | undefined;
}

const schema = z.object({
 password: z
  .string()
  .min(8, 'senha precisa ter pelo menos 8 caracteres')
  .max(72, 'A senha deve ter no maxímo de 72 caracteres'),
});

type FormProps = z.infer<typeof schema>;

export default function SendRemoveTwoAuthCodeForm({ ...props }: props) {
 const router = useRouter();
 const cookie = props.cookieName + '=' + props.cookieVal;
 const [error, setError] = useState<string | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [popUpError, setPopUpError] = useState<boolean>(false);
 const [next, setNext] = useState<boolean>(false);

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
   (async function () {
    const res = await GetUser(cookie);
    if (
     res.data &&
     'twoAuthEmail' in res.data &&
     res.data.twoAuthEmail == '' &&
     res.data &&
     'twoAuthTelefone' in res.data &&
     res.data.twoAuthTelefone == ''
    ) {
     router.push('/');
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
  setError(null);
  setLoad(true);
  const res = await SendRemoveTwoAuthCode(cookie, {
   senha: data.password,
  });
  if (res == 'contato não cadastrado') {
   router.push('/auth/entrar');
   return;
  }
  if (res == 'usuário não possui autenticação de dois fatores') {
   router.push('/');
   return;
  }
  if (res == 'seu código foi gerado porem não foi possivel criar uma sessão') {
   router.push('/auth/entrar');
   return;
  }
  if (res == 500) {
   setPopUpError(true);
  } else if (res == 'senha errada') {
   setError('senha inválida');
  } else if (res == 'usuário não é verificado') {
   router.push('/auth/validar-contato');
  } else if (res == 401) {
   await deleteCookie('userProfile');
   router.push('/auth/entrar');
  } else if (res == 200) {
   localStorage.setItem(
    'timeSendRemoveTwoAuthCode',
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
        <h1>Remover autenticação de dois fatores</h1>
        <label htmlFor="password">Sua senha</label>
        <Password {...register('password')} id="password" placeholder="senha" />
        {errors.password ? (
         <p className={styles.error}>{errors.password.message}</p>
        ) : (
         error && <p className={styles.error}>{error}</p>
        )}
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
    <CheckRemoveTwoAuthCodeForm cookie={cookie} />
   )}
  </>
 );
}
