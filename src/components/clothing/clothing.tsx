'use client'
import GetClothing, { getClothingByIdResponse } from "@/api/clothing/getClothing"
import SkeletonImage from "@/components/skeletonImage/skeletonImage"
import styles from './clothing.module.css'
import stylesLoad from './clothingLoad.module.css'
import { notFound, useRouter } from "next/navigation"
import React, { SyntheticEvent, useEffect, useRef, useState } from "react"
import { slideWithControl } from "@/funcs/slideWithControll"
import Skeleton from "../skeleton/skeleton"
import AddClothingToCart from "@/api/clothing/addClothingToCart"
import SpinLoading from "../spinLoading/spinLoading"
import PopupError from "../popupError/popupError"
import IndexSlideImage from 'next/image'
import Counter from "../counter/counter"
import Sizes from "../sizes/sizes"
import { ChangeColor, ModalColor } from "../modalColor/modalColor"
import Shop from 'next/image'
import formatPrice from "@/funcs/formatPrice"

interface props {
  id: string
  cookieName: string | undefined
  cookieVal: string | undefined
}

export default function Clothing({...props}: props) {
  const router = useRouter()
  const [data,setData] = useState<getClothingByIdResponse | null>(null)
  const [load, setLoad] = useState<boolean>(false)
  const [popUpError, setPopUpError] = useState<boolean>(false)
  const [count,setCount] = useState<number>(1)
  const [size,setSize] = useState<"p" | "m" | "g" | "gg">("p")
  const [color,setColor] = useState<string | null>(null)
  const [mainColor,setMainColor] = useState<string | null>(null)
  const [windowWidth,setWindowWidth] = useState<boolean>(false)
  const slide = useRef<HTMLUListElement | null>(null)
  const images = useRef<HTMLDivElement | null>(null)
  const indexImages = useRef<HTMLUListElement | null>(null)
  const buttonToOpenModalRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setPopUpError(false)
    setLoad(true)
    if(props.cookieName == undefined || props.cookieVal == undefined) {
      router.push("/auth/entrar")
      return
    }
    if(color == null) {
      return
    }
    const cookie = props.cookieName+"="+props.cookieVal
    const res = await AddClothingToCart(cookie, {
      cor: color,
      quantidade: count,
      roupa_id: props.id,
      tamanho: size
    })
    if(res == 401) {
      router.push("/auth/entrar")
      return
    }
    if(res == 500) {
      setPopUpError(true)
    }
    if(res == "quantidade excede o stock" || res == "roupa ou inventário não encontrado") {   
      setData(null)                   
      setSize("p")
      setColor(null)
      setMainColor(null)
      setCount(1)
      setPopUpError(true)
    }
    setLoad(false)
  }

  function handleCount(event: SyntheticEvent) {
    if (event.currentTarget.id == "more") {
      (data?.clothing?.inventario.map((inventory) => {
        if (inventory.cor == color) {
          if (inventory[size] <= count) {
            setCount(inventory[size] - 1)
          }
          setCount((count) => count = count + 1)
        } 
      }))
    } else if (count - 1 > 0) {
      setCount((count) => count = count - 1)
    } 
  }

  useEffect(() => {
    if(data == null) {
      (async function() {
        const res = await GetClothing(props.id)
        res.clothing?.inventario.map(({corPrincipal, cor}) => {
          if (corPrincipal && color == null) {
            setColor(cor)
            setMainColor(cor)
          }
        })
        setData(res);
        if(res.status === 500) {
          setPopUpError(true)
        }
        window.innerWidth >= 800 && setWindowWidth(true)
        window.addEventListener("resize", () => {
          if (window.innerWidth >= 800 && indexImages.current?.firstChild == null) {
            setWindowWidth(true)
          } else if (window.innerWidth < 800 && indexImages.current?.firstChild != null) { 
            setWindowWidth(false);
          }
        })
      })()
    }
  },[data])

  useEffect(() => {
    if (
      slide.current instanceof HTMLUListElement &&
      images.current instanceof HTMLDivElement &&
      color != null
    ) {
      if (images.current.lastChild instanceof HTMLDivElement) {
        images.current.removeChild(images.current.lastChild)
      }
      slideWithControl(slide.current, images.current, indexImages.current?.childNodes, styles.index, styles.active, styles.activeThumb)
    }
  },[color])

  useEffect(() => {
    data?.clothing?.inventario.map((inventory) => {
      if (inventory.cor == color) {
        if (inventory[size] <= count) {
          setCount(inventory[size])
        }
      }
    })
  },[size, color])

  return (
    <>
     {load && <SpinLoading />}
     {popUpError && <PopupError handleOut={(() => setPopUpError(false))} />}
      <main className={`${styles.main} ${load && styles.opacity}`}>
        <ModalColor inventario={data?.clothing?.inventario} mainColor={mainColor} modalRef={modalRef} setColor={setColor} />
        <section>
        {data?.status == 404 && notFound()}
        <ul className={`${styles.indexImages} ${data?.clothing && styles.load}`} ref={indexImages} aria-hidden="true">
        {data?.clothing ? data.clothing.inventario.map(({ images, imgDesc, cor }) => {
            return (
              (color == cor && windowWidth) &&
                images?.map(( src, index ) => {
                    return (
                      <li key={src}>
                        { <button className={index == 0 ? styles.activeThumb : ""} id={index.toString()} aria-hidden="true" tabIndex={-1}><IndexSlideImage src={src} loading="lazy" alt={imgDesc} width={290} height={460} key={data.clothing?.id} draggable={false} aria-hidden="true"/></button> }
                      </li>
                    )
                  })
                )
            }) : <div className={stylesLoad.indexImages} aria-label="carregando conteúdo" tabIndex={0}><Skeleton/></div>}
          </ul>
          <div className={styles.images} ref={images} style={{display: data?.clothing ? "initial" : "none"}}>
            <ul className={styles.slide} ref={slide} aria-label="slide que mostra a imagem de cada roupa" tabIndex={0}>
              { data?.clothing && data.clothing.inventario[0].images == null && notFound() }
              { data?.clothing?.inventario.map(({ images,imgDesc, cor }) => {
                return (
                  color == cor &&
                  images?.map(( src, index ) => {
                    return (
                      <li className={styles.product} key={src}>
                        { <SkeletonImage src={src} alt={imgDesc} loading="lazy" width={290} height={460} className={styles.clothing} key={data.clothing?.id} id={index.toString()} draggable={false} tabIndex={0}/> }
                      </li>
                    )
                  })
                )
              })}
            </ul>
            </div>
            {!data?.clothing && <div className={stylesLoad.images} aria-label="carregando conteúdo" tabIndex={0}><Skeleton/></div>}
            {data?.clothing ? <form className={styles.infos} onSubmit={handleSubmit}>
              <p className={styles.name} aria-label="nome da roupa">{data.clothing.nome}</p>
              <p className={styles.price} aria-label="preço da roupa">R${formatPrice(data.clothing.preco)}</p>
              <p className={styles.description} aria-label="descrição da roupa">{data.clothing.descricao}</p>
              <div className={styles.gender}>
                <p>genêro</p>
                <p>{data.clothing.sexo == "M" ? "masculino" : data.clothing.sexo == "F" ? "feminino": "unissex"}</p>
              </div>
              <div className={styles.sizes}>
                <p>tamanhos</p>
                <Sizes color={color} inventory={data.clothing.inventario} setSize={setSize} size={size} />
                </div>
                <div className={styles.category}>
                  <p>categoria</p>
                  <p>{data.clothing.categoria}</p>
                </div>
                <div className={styles.counter}>
                  <p>quantidades</p>
                  <Counter count={count} handleCount={handleCount}/>
                </div>
                <div className={styles.material} aria-label="material da roupa">
                  <p>material</p>
                  <p>{data.clothing.material}</p>
                </div>
                <div className={styles.colors} aria-label="cores da roupa">
                  <p>cores</p>
                  <ChangeColor buttonToOpenModalRef={buttonToOpenModalRef} color={color} modalRef={modalRef} />
                </div>
                <button className={styles.addPurchase}><Shop src={"/img/shop.png"} alt="" width={14} height={17} aria-label={`adicionar roupa com cor ${color}, tamanho ${size}, quantidade ${count} para meu carrinho`}/><p aria-hidden="true">adicionar a bolsa</p></button>
              </form>
            : <div className={stylesLoad.infos} aria-label="carregando conteúdo" tabIndex={0}>
              <Skeleton className={stylesLoad.name}/>
              <Skeleton className={stylesLoad.price}/>
              <Skeleton className={stylesLoad.content}/>
            </div>}
          </section>
        </main>
    </>
  )
}