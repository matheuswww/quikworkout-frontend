'use client';

import GetClothing, { getClothing } from '@/api/manager/clothing/getClothing';
import { useEffect, useState } from 'react';
import Clothing from './clothing';
import SpinLoading from '@/components/spinLoading/spinLoading';
import { useRouter } from 'next/navigation';
import styles from './clothings.module.css';
import PopupError from '@/components/popupError/popupError';
import Success from '@/components/successs/success';
import Link from 'next/link';
import Menu from '../menu/menu';

interface props {
 cookieName?: string;
 cookieVal?: string;
}

export default function Clothings({ ...props }: props) {
 const router = useRouter();
 const [data, setData] = useState<getClothing | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [popupError, setPopupError] = useState<boolean>(false);
 const [newPageLoad, setNewPageLoad] = useState<boolean>(false);
 const [end, setEnd] = useState<boolean>(false);
 const [newPage, setNewPage] = useState<boolean>(false);
 const [success, setSuccess] = useState<boolean>(false);

 useEffect(() => {
  if (!end && !newPageLoad) {
   (async function () {
    setPopupError(false);
    if (props.cookieName == undefined || props.cookieVal == undefined) {
     router.push('/manager-quikworkout/auth');
     return;
    }
    const cookie = props.cookieName + '=' + props.cookieVal;
    let cursor: string | undefined;
    if (data?.clothing) {
     setNewPageLoad(true);
     const lastIndex = data.clothing.length;
     if (lastIndex && lastIndex - 1 >= 0 && data.clothing) {
      cursor = data.clothing[lastIndex - 1].criadoEm;
     }
    }
    const res = await GetClothing(cookie, cursor);
    if (data?.clothing && res.status == 404) {
     setEnd(true);
     setLoad(false);
     setNewPageLoad(false);
     return;
    }
    if (data?.clothing && res.status == 500) {
     setPopupError(true);
     setLoad(false);
     setNewPageLoad(false);
     setNewPage(false);
     return;
    }
    if (res.status == 401) {
     router.push('/manager-quikworkout/auth');
     return;
    }
    if (res.status == 200) {
     setData(res);
    }
    if (data?.clothing && res.clothing) {
     data.clothing.push(...res.clothing);
     setData({
      clothing: data.clothing,
      status: 200,
     });
    }
    setNewPage(false);
    setTimeout(() => {
     setNewPageLoad(false);
    }, 50);
    setLoad(false);
   })();
  }
 }, [newPage]);

 useEffect(() => {
  const final = document.querySelector('#final');
  if (final instanceof HTMLSpanElement) {
   const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
     if (final.classList.contains(styles.show)) {
      setNewPage(true);
     }
    }
   });
   observer.observe(final);
   return () => observer.disconnect();
  }
 }, []);

 return (
  <>
   <Menu cookieName={props.cookieName} cookieVal={props.cookieVal} />
   {popupError && <PopupError handleOut={() => setPopupError(false)} />}
   {load && <SpinLoading />}
   <Success
    setSuccess={setSuccess}
    success={success}
    msg="Alterado com sucesso"
   />
   <main
    className={`${styles.main} ${load && styles.opacity} ${(data?.status == 500 || data?.status == 404) && styles.mainError}`}
   >
    <section>
     {data?.status != 404 && data?.status != 500 && (
      <h1 className={styles.title}>Roupas</h1>
     )}
     {data?.clothing
      ? data.clothing.map((clothing, index) => {
         return (
          <Clothing
           allData={data.clothing}
           setData={setData}
           setSuccess={setSuccess}
           load={load}
           success={success}
           setLoad={setLoad}
           setPopupError={setPopupError}
           cookieName={props.cookieName}
           cookieVal={props.cookieVal}
           data={clothing}
           key={clothing.id}
           index={index}
          />
         );
        })
      : load && <p className={styles.p}>carregando...</p>}
     {data?.status == 404 && (
      <div>
       <p className={styles.error}>Nenhum produto foi encontrado!</p>
       <Link className={styles.link} href={'/manager-quikworkout/criar-roupa'}>
        Criar roupa
       </Link>
      </div>
     )}
     {data?.status == 500 && (
      <p className={styles.error}>
       Parece que houve um erro! Tente recarregar a página
      </p>
     )}
     {
      <span
       aria-hidden={true}
       id="final"
       className={`${data && styles.show}`}
      ></span>
     }
     {newPageLoad && (
      <div className={styles.ldsRing} aria-label="carregando" tabIndex={0}>
       <div aria-hidden="true"></div>
       <div aria-hidden="true"></div>
       <div aria-hidden="true"></div>
       <div aria-hidden="true"></div>
      </div>
     )}
    </section>
   </main>
  </>
 );
}
