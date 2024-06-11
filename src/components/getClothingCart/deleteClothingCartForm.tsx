'use client'
import { Dispatch, SetStateAction, SyntheticEvent, useDebugValue, useEffect, useRef } from 'react'
import styles from './deleteClothingCartForm.module.css'
import { clothingCart } from './getClothingCartForm'
import DeleteClothingCart from '@/api/clothing/deleteClothingCart'
import { useRouter } from 'next/navigation'
import { deleteCookie } from '@/action/deleteCookie'

interface params {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  buttonToOpen: HTMLButtonElement | null
  clothing: clothingCart | null
  cookieName: string | undefined
  cookieVal: string | undefined
  setPopupError: Dispatch<SetStateAction<boolean>>
}

export default function DeleteClothingCartForm({open, setOpen, buttonToOpen, clothing, cookieName, cookieVal, setPopupError}: params) {
  const router = useRouter()
  const form = useRef<HTMLFormElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if(open) {
      window.addEventListener("click", close)
      if(form.current instanceof HTMLElement) {
        form.current.focus()
        form.current.style.display = "initial"
      }
      setTimeout(() => {
        if(form.current instanceof HTMLFormElement) {
          form.current.classList.add(styles.active)
         }
      });
    }
  },[open])
  
  function close(event: MouseEvent) {
    if(event.target instanceof HTMLElement && (form.current && !form.current.contains(event.target) && event.target.contains(buttonToOpen) || closeRef.current?.contains(event.target))) {
      window.removeEventListener("click", close)
      if(form.current instanceof HTMLFormElement) {
        form.current.classList.remove(styles.active) 
        setTimeout(() => {
          form.current instanceof HTMLElement && (form.current.style.display = "none")
        }, 500);
       }
       setOpen(false)
    }
  }
  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    if(cookieName == undefined || cookieVal == undefined) {
      await deleteCookie("userProfile")
      router.push("/auth/entrar")
      return
    }
    if(clothing?.clothing_id && clothing.color && clothing.size) {
      const cookie = cookieName+"="+cookieVal
        const data = await DeleteClothingCart(cookie, {
        cor: clothing.color,
        roupa_id: clothing.clothing_id,
        tamanho: clothing.size
      })
      if(data === 401) {
        await deleteCookie("userProfile")
        router.push("/auth/entrar")
        return
      }
      document.body.style.pointerEvents = "none"
      if(form.current instanceof HTMLFormElement) {
        form.current.classList.remove(styles.active) 
       }
      setOpen(false)
      window.location.reload()
    }
  }

  return (
    <form tabIndex={0} className={styles.container} onSubmit={handleSubmit} ref={form}>
      <p>Tem certeza que deseja deletar este item?</p>
      <button type="submit" onClick={(() => setOpen(false))} className={styles.delete}>Deletar</button>
      <button aria-label="fechar" type="button" className={styles.close} ref={closeRef}><span aria-hidden="true">x</span></button>
   </form>
  )
}