'use client';
import styles from './sendContactValidationCodeForm.module.css';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SpinLoading from '../spinLoading/spinLoading';
import { deleteCookie } from '@/action/deleteCookie';
import sendContactValidationCode from '@/api/auth/sendContactValidationCode';
import PopupError from '../popupError/popupError';
import CheckContactValidationCodeForm from './checkContactValidationCodeForm';
import GetUser, { getUserResponse } from '@/api/user/getUser';

interface props {
 cookieName: string | undefined;
 cookieVal: string | undefined;
 welcome: boolean | undefined;
}

export default function SendContactValidationCodeForm({ ...props }: props) {
 const router = useRouter();
 const cookie = props.cookieName + '=' + props.cookieVal;
 const [data, setData] = useState<getUserResponse | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [popUpError, setPopUpError] = useState<boolean>(false);
 const [next, setNext] = useState<boolean>(false);

 useEffect(() => {
  if (props.cookieName == undefined || props.cookieVal == undefined) {
   router.push('/auth/entrar');
  } else {
   (async function () {
    const res = await GetUser(cookie);
    setData(res);
    if (res.data && 'verificado' in res.data && res.data.verificado) {
     setLoad(true);
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

 async function handleSubmnit(event: SyntheticEvent) {
  event.preventDefault();
  const res = await sendContactValidationCode(cookie);
  if (res == 401) {
   await deleteCookie('userProfile');
   router.push('/auth/cadastrar');
  }
  if (res == 500) {
   setPopUpError(true);
  }
  if (res == 404) {
   router.push('/auth/cadastrar');
  }
  if (res == 400) {
   router.push('/');
  }
  if (res == 200) {
   setNext(true);
  }
  if (res == 'usuário já verificado') {
   setLoad(true);
   router.push('/');
   return;
  }
  setData(null);
  localStorage.setItem(
   'timeSendContactValidationCode',
   new Date().getTime().toString(),
  );
 }

 return (
  <>
   {!next ? (
    <>
     {load && <SpinLoading />}
     {popUpError && <PopupError handleOut={() => setPopUpError(false)} />}
     <main className={`${styles.main} ${load && styles.load}`}>
      <form className={styles.form} onSubmit={handleSubmnit}>
       {data?.status != 500 ? (
        <>
         <h1>{props.welcome ? 'Estamos quase lá!' : 'Validação de contato'}</h1>
         {load ? (
          <p>Carregando...</p>
         ) : (
          <p>
           Clique aqui para enviarmos um código de verificação para seu email
          </p>
         )}
         <button disabled={load ? true : false}>
          {load ? 'Carregando...' : 'Enviar código'}
         </button>
        </>
       ) : (
        <>
         <h1>Oops! parece que houve um erro!</h1>
         <p>
          Parece que houve um erro com nossos servidores, tente recarregar a
          página
         </p>
        </>
       )}
      </form>
     </main>
    </>
   ) : (
    <CheckContactValidationCodeForm cookie={cookie} />
   )}
  </>
 );
}
