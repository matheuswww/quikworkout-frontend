'use client'
import { Dispatch, SetStateAction, SyntheticEvent, useDebugValue, useEffect, useRef } from 'react'
import styles from './deleteClothingCartForm.module.css'
import { clothingCart } from './getClothingCartForm'
import DeleteClothingCart from '@/api/clothing/deleteClothingCart'
import { useRouter } from 'next/navigation'
import { deleteCookie } from '@/action/deleteCookie'
import { getClothingCartResponse } from '@/api/clothing/getClothingCart'

interface params {
  setData: Dispatch<SetStateAction<getClothingCartResponse | null>>
  setLoad: Dispatch<SetStateAction<boolean>>
  load: boolean
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  clothing: clothingCart | null
  cookieName: string | undefined
  cookieVal: string | undefined
  setPopupError: Dispatch<SetStateAction<boolean>>
}

export default function DeleteClothingCartForm({setData, open, setOpen, clothing, cookieName, cookieVal, setPopupError, load, setLoad}: params) {
  const router = useRouter()
  const form = useRef<HTMLFormElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if(open) {
      if(form.current instanceof HTMLElement) {
        form.current.focus()
        form.current.style.display = "initial"
      }
      setTimeout(() => {
        window.addEventListener("click", close)
      }, 500);
      setTimeout(() => {
        if(form.current instanceof HTMLFormElement) {
          form.current.classList.add(styles.active)
         }
      });
    }
  },[open])
  
  function close(event: MouseEvent) {
    if(event.target instanceof HTMLElement && (form.current && !form.current.contains(event.target) || closeRef.current?.contains(event.target))) {
      window.removeEventListener("click", close)
      if(form.current instanceof HTMLFormElement) {
        form.current.classList.remove(styles.active) 
        setTimeout(() => {
          form.current instanceof HTMLElement && (form.current.style.diswplay = "none")
          setOpen(false)
        }, 500);
       }
    }
  }
  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    if(cookieName == undefined || cookieVal == undefined) {
      await deleteCookie("userProfile")
      router.push("/auth/entrar")
      return
    }
    setLoad(true)
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
      if(data == 404) {
        window.location.reload()
        return
      }
      if(data == 500) {
        setPopupError(true)
      }
      if(data == 200) {
        setData((d) =>  {
          if (!d?.clothing) return d;
          const newData = d.clothing.filter((_, i) => i !== clothing.index);
          return {
            status: 200,
            clothing: newData
          }
        })
      }
      closeRef.current instanceof HTMLButtonElement && closeRef.current.click()
      setLoad(false)
      setOpen(false)
    }
  }

  return (
    <form tabIndex={0} className={styles.container} id={`${load && styles.formOpacity}`} onSubmit={handleSubmit} ref={form}>
      <p>Tem certeza que deseja deletar este item?</p>
      <button type="submit" onClick={(() => setOpen(false))} className={styles.delete}>Deletar</button>
      <button aria-label="fechar" type="button" className={styles.close} ref={closeRef}><span aria-hidden="true">x</span></button>
   </form>
  )
}