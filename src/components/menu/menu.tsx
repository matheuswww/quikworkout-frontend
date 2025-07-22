'use client';

import Logo from 'next/image';
import styles from './menu.module.css';
import Link from 'next/link';
import Img from 'next/image';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { deleteCookie } from '@/action/deleteCookie';

interface props {
 cookieName?: string;
 cookieVal?: string;
}

export default function Menu(props: props) {
 const path = usePathname();
 const router = useRouter();
 const [page, setPage] = useState<
  'home' | 'my-bag' | 'my-order' | 'my-account' | null
 >(null);
 const [menu, setMenu] = useState<boolean>(false);
 const menuRef = useRef<HTMLElement | null>(null);

 const buttonRef = useRef<HTMLButtonElement | null>(null);
 const containerRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
  if (path == '/') {
   setPage('home');
  } else if (path == '/usuario/minha-bolsa') {
   setPage('my-bag');
  } else if (path == '/usuario/meus-pedidos') {
   setPage('my-order');
  } else if (path == '/usuario/minha-conta') {
   setPage('my-account');
  }
 }, []);

 async function handleLogout() {
  await deleteCookie('userProfile');
  router.push('/');
 }

 function handleClick(event: SyntheticEvent) {
  event.stopPropagation();
  if (
   menuRef.current instanceof HTMLElement &&
   buttonRef.current instanceof HTMLButtonElement &&
   !menuRef.current.classList.contains(styles.active)
  ) {
   menuRef.current.style.display = 'flex';
   buttonRef.current.style.pointerEvents = 'none';
   setTimeout(() => {
    setMenu(true);
   });
   setTimeout(() => {
    if (
     menuRef.current instanceof HTMLElement &&
     buttonRef.current instanceof HTMLButtonElement
    ) {
     menuRef.current.focus();
     buttonRef.current.style.pointerEvents = 'initial';
    }
    document.addEventListener('click', handelClose);
   }, 500);
  }
  function handelClose(event: Event) {
   if (
    menuRef.current instanceof HTMLElement &&
    buttonRef.current instanceof HTMLButtonElement &&
    containerRef.current instanceof HTMLDivElement
   ) {
    if (
     (event.target instanceof HTMLElement &&
      !event.target.contains(menuRef.current)) ||
     (event.target instanceof HTMLElement &&
      containerRef.current instanceof HTMLDivElement &&
      event.target.contains(containerRef.current))
    ) {
     buttonRef.current.style.pointerEvents = 'none';
     document.removeEventListener('click', handelClose);
     setMenu(false);
     setTimeout(() => {
      if (
       menuRef.current instanceof HTMLElement &&
       buttonRef.current instanceof HTMLButtonElement
      ) {
       menuRef.current.style.display = 'none';
       buttonRef.current.style.pointerEvents = 'initial';
      }
     }, 500);
    }
   }
  }
 }

 return (
  <>
   <div className={styles.container} ref={containerRef}>
    <Link href="/" className={styles.linkLogo}>
     <Logo
      src="/img/logo.png"
      alt="logo da quikworkout"
      width={125}
      height={60}
      className={styles.logo}
     />
    </Link>
    <nav
     tabIndex={0}
     className={`${styles.content} ${menu && styles.active}`}
     ref={menuRef}
     arial-aria-label="menu"
    >
     {props.cookieName && props.cookieVal ? (
      <>
       <Link href="/" className={`${page == 'home' && styles.currentPage}`}>
        <Img
         alt="icone de uma casa"
         src="/img/home.png"
         width={22}
         height={20}
        />
        Home
       </Link>
       <Link
        href="/usuario/minha-bolsa"
        className={`${page == 'my-bag' && styles.currentPage}`}
       >
        <Img
         alt="icone de uma bolsa"
         src="/img/shop.png"
         width={22}
         height={21}
         className={styles.bag}
         style={{ marginLeft: '5px', marginRight: '6px', top: '3px' }}
        />
        Minha bolsa
       </Link>
       <Link
        href="/usuario/meus-pedidos"
        className={`${page == 'my-order' && styles.currentPage}`}
       >
        <Img
         alt="icone de pedidos"
         src="/img/myorder.png"
         width={22}
         height={22}
         className={styles.bag}
         style={{ marginLeft: '5px' }}
        />
        Meus pedidos
       </Link>
       <Link
        href="/usuario/minha-conta"
        className={`${page == 'my-account' && styles.currentPage}`}
       >
        <Img
         alt="icone de minha conta"
         src="/img/account.png"
         width={24}
         height={24}
         className={styles.bag}
         style={{ marginLeft: '4px', marginRight: '3px' }}
        />
        Minha conta
       </Link>
       <button
        className={styles.exit}
        onClick={handleLogout}
        aria-label="sair de minha conta"
       >
        <Img
         alt="icone de porta indicando saída"
         src="/img/exit.png"
         width={22}
         height={20}
         style={{ top: '4px', position: 'relative' }}
        />{' '}
        Sair
       </button>
      </>
     ) : (
      <>
       <Link href="/" className={`${page == 'home' && styles.currentPage}`}>
        <Img
         alt="icone de uma casa"
         src="/img/home.png"
         width={22}
         height={20}
        />
        Home
       </Link>
       <Link href="/auth/entrar">
        <Img
         alt="icone de entrar"
         src="/img/account.png"
         width={24}
         height={24}
         className={styles.bag}
         style={{ marginLeft: '4px', marginRight: '3px' }}
        />
        Entrar
       </Link>
       <Link href="/auth/cadastrar">
        <Img
         alt="icone de cadastrar"
         src="/img/cadastrar.png"
         width={24}
         height={24}
         className={styles.bag}
         style={{ marginLeft: '4px', marginRight: '3px' }}
        />
        Cadastrar
       </Link>
      </>
     )}
    </nav>
    <button
     className={`${styles.menu} ${menu && styles.active}`}
     aria-label="menu"
     onClick={handleClick}
     ref={buttonRef}
    >
     <span aria-hidden="true"></span>
     <span aria-hidden="true"></span>
     <span aria-hidden="true"></span>
    </button>
   </div>
  </>
 );
}
