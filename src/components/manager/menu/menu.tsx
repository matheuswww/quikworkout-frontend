"use client"

import Logo from 'next/image'
import styles from './menu.module.css'
import Link from 'next/link'
import Img from "next/image"
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { usePathname,useRouter } from 'next/navigation'
import { deleteCookie } from '@/action/deleteCookie'

interface props {
  cookieName?: string
  cookieVal?: string
}

export default function Menu(props:props) {
  const path = usePathname()
  const router = useRouter()
  const [page, setPage] = useState<"home" | "criar-roupa" | "roupas" | "cancelar-pedido" | null>(null)
  const [menu, setMenu] = useState<boolean>(false)
  const menuRef = useRef<HTMLElement | null>(null)

  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
    if(path == "/manager-quikworkout") {
      setPage("home")
    } else if (path == "/manager-quikworkout/criar-roupa") {
      setPage("criar-roupa")
    } else if (path == "/manager-quikworkout/roupas") {
      setPage("roupas")
    } else if(path == "/manager-quikworkout/cancelar-pedido") {
      setPage("cancelar-pedido")
    }
  },[])

  async function handleLogout() {
    await deleteCookie("adminProfile")
    router.push("/")
  }

  function handleClick(event: SyntheticEvent) {
    event.stopPropagation()
    if(menuRef.current instanceof HTMLElement && buttonRef.current instanceof HTMLButtonElement && !menuRef.current.classList.contains(styles.active)) {
      menuRef.current.style.display = "flex"
      buttonRef.current.style.pointerEvents = "none"
      setTimeout(() => {
        setMenu(true) 
      });
      setTimeout(() => {
        if(menuRef.current instanceof HTMLElement && buttonRef.current instanceof HTMLButtonElement) {
          menuRef.current.focus()
          buttonRef.current.style.pointerEvents = "initial"
        }
        document.addEventListener("click", handelClose)
      }, 500);
    }
    function handelClose(event: Event) {
      if(menuRef.current instanceof HTMLElement && buttonRef.current instanceof HTMLButtonElement) {
        if((event.target instanceof HTMLElement && !event.target.contains(menuRef.current)) || (event.target instanceof HTMLElement && containerRef.current instanceof HTMLDivElement && event.target.contains(containerRef.current))) {
          buttonRef.current.style.pointerEvents = "none"
          document.removeEventListener("click", handelClose)
          setMenu(false)
          setTimeout(() => {
            if(menuRef.current instanceof HTMLElement && buttonRef.current instanceof HTMLButtonElement) {
              menuRef.current.style.display = "none"
              buttonRef.current.style.pointerEvents = "initial"
            }
          }, 500);
        }
      }
    }
  }

 return (
    <header>
      <div className={styles.container} ref={containerRef}>
        <Link href="/manager-quikworkout">
          <Logo 
            src="/img/logo.png"
            alt="logo da quikworkout"
            width={140}
            height={50}
            className={styles.logo}
          />
        </Link>
        <nav tabIndex={0} className={`${styles.content} ${menu && styles.active}`} ref={menuRef} arial-aria-label="menu" >
          {
            props.cookieName && props.cookieVal ?
            <>
              <Link href="/manager-quikworkout" className={`${page == "home" && styles.currentPage}`}><Img alt="icone de uma casa" src="/img/home.png" width={22} height={20} />Home</Link>
              <Link href="/manager-quikworkout/roupas" className={`${page == "roupas" && styles.currentPage}`}><Img alt="icone de uma bolsa" src="/img/shop.png" width={22} height={21} className={styles.bag} style={{marginLeft: "5px",marginRight: "6px",top:"3px"}} />Roupas</Link>
              <Link href="/manager-quikworkout/criar-roupa" className={`${page == "criar-roupa" && styles.currentPage}`}><Img alt="icone de adiconar" src="/img/add.png" width={22} height={22} className={styles.bag} style={{marginLeft: "5px"}} />Criar roupa</Link>
              <Link href="/manager-quikworkout/cancelar-pedido" className={`${page == "cancelar-pedido" && styles.currentPage}`}><Img alt="icone de pedido" src="/img/myorder.png" width={24} height={24} className={styles.bag} style={{marginLeft: "4px",marginRight: "3px"}} />Cancelar pedido</Link>
              <button className={styles.exit} onClick={handleLogout} aria-label="sair de minha conta"><Img alt="icone de porta indicando saída" src="/img/exit.png" width={22} height={20} style={{top: "4px",position: "relative"}} /> Sair</button>
            </>
            : <>
            <Link href="/manager-quikworkout/auth"><Img alt="icone de entrar" src="/img/account.png" width={24} height={24} className={styles.bag} style={{marginLeft: "4px",marginRight: "3px"}} />Entrar</Link>
            </>
          }
        </nav>
        <button className={`${styles.menu} ${menu && styles.active}`} aria-label="menu" onClick={handleClick} ref={buttonRef}>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>
    </header>
 )
}