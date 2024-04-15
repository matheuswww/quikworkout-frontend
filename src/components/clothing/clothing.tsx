'use client'
import GetClothing, { getClothingByIdResponse } from "@/api/clothing/getClothing"
import SkeletonImage from "@/components/skeletonImage/skeletonImage"
import styles from './clothing.module.css'
import stylesLoad from './clothingLoad.module.css'
import { notFound } from "next/navigation"
import React, { ReactNode, SyntheticEvent, useEffect, useRef, useState } from "react"
import Shop from 'next/image'
import { slideWithControl } from "@/funcs/slideWithControll"
import Skeleton from "../skeleton/skeleton"

interface props {
  id: string
}

export default function Clothing({...props}: props) {
  const slide = useRef<HTMLUListElement | null>(null)
  const images = useRef<HTMLDivElement | null>(null)
  const [data,setData] = useState<getClothingByIdResponse | null>(null)
  const [count,setCount] = useState<number>(0)
  const [size,setSize] = useState<"p" | "m" | "g" | "gg">("p")
  const [color,setColor] = useState<string | null>(null)
  const [mainColor,setMainColor] = useState<string | null>(null)
  const [windowWidth,setWindowWidth] = useState<boolean>(false)
  const indexImages = useRef<HTMLUListElement | null>(null)
  const buttonToOpenModalRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  function handleCount(event: SyntheticEvent) {
    if (event.currentTarget.classList.contains(styles.more)) {
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

  function handleClick() {
    const main = document.body.firstChild
    let section = main instanceof HTMLElement && main.lastChild
    if (section instanceof HTMLElement && modalRef.current instanceof HTMLElement && buttonToOpenModalRef.current instanceof HTMLElement) {
      section.style.opacity = ".1"
      modalRef.current.style.display = "flex"
      setTimeout(() => {
        modalRef.current instanceof HTMLElement && modalRef.current.classList.add(styles.active) 
      });
      buttonToOpenModalRef.current.style.pointerEvents = "none"
    }
    document.addEventListener("click", handleCloseModal)
    function handleCloseModal() {
      modalRef.current instanceof HTMLElement && modalRef.current.classList.remove(styles.active)
      setTimeout(() => {
        if(buttonToOpenModalRef.current instanceof HTMLElement && modalRef.current instanceof HTMLElement) {          
          buttonToOpenModalRef.current.style.pointerEvents = "initial"
          modalRef.current.style.display = "none"
        }
       }, 500)
      if(section instanceof HTMLElement) {
        section.style.opacity = "1"
      }
      document.removeEventListener("click", handleCloseModal)
    }
  }

  useEffect(() => {
    (async function() {
      const res = await GetClothing(props.id)
      setData(res);
      window.innerWidth >= 800 && setWindowWidth(true)
      window.addEventListener("resize", () => {
        if (window.innerWidth >= 800 && indexImages.current?.firstChild == null) {
          setWindowWidth(true)
        } else if (window.innerWidth < 800 && indexImages.current?.firstChild != null) { 
          setWindowWidth(false);
        }
      })
    })()
  },[])

  useEffect(() => {
    if (
      slide.current &&
      images.current &&
      slide.current instanceof HTMLElement &&
      images.current instanceof HTMLElement
    ) {
      if (images.current.children[1] != undefined) {
        images.current.removeChild(images.current.children[1])
      }
      slideWithControl(slide.current, images.current, indexImages.current?.childNodes, styles.index, styles.active, styles.activeThumb)
    }
  },[data, color])

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
    <div className={styles.selectModal} ref={modalRef}>
    {mainColor &&  <button value={mainColor} key={mainColor} onClick={((event: SyntheticEvent) => event.currentTarget instanceof HTMLButtonElement && setColor(event.currentTarget.value))}>{mainColor}</button>}
    {data?.clothing?.inventario.map(({cor,corPrincipal}) => {
      if (corPrincipal && color == null) {
        setColor(cor)
        setMainColor(cor)
      }
      return !corPrincipal && <button value={cor} key={cor} onClick={((event: SyntheticEvent) => event.currentTarget instanceof HTMLButtonElement && setColor(event.currentTarget.value))}>{cor}</button>
    })}
    </div>
    <section>
     {data?.status == 404 && notFound()}
     <ul className={`${styles.indexImages} ${data?.clothing && styles.loading}`} ref={indexImages} >
     {data?.clothing ? data.clothing.inventario.map(({ images, imgDesc, cor }) => {
        return (
          (color == cor && windowWidth) &&
            images?.map(( src, index ) => {
                return (
                  <li key={src}>
                    { <button className={index == 0 ? styles.activeThumb : ""} id={index.toString()}><SkeletonImage src={src} alt={imgDesc} width={290} height={460} key={data.clothing?.id} draggable={false}/></button> }
                  </li>
                )
              })
            )
        }) : <div className={stylesLoad.indexImages}><Skeleton/></div>}
      </ul>
      {data?.clothing? <div className={styles.images} ref={images}>
        <ul className={styles.slide} ref={slide}>
          { data.clothing.inventario[0].images == null && notFound() }
          { data.clothing.inventario.map(({ images,imgDesc, cor }) => {
            return (
              color == cor &&
              images?.map(( src ) => {
                return (
                  <li className={styles.product} key={src}>
                    { <SkeletonImage src={src} alt={imgDesc} width={290} height={460} className={styles.clothing} key={data.clothing?.id} draggable={false}/> }
                  </li>
                )
              })
            )
          })}
        </ul>
        </div>
        : <div className={stylesLoad.images}><Skeleton/></div>}
        {data?.clothing ? <div className={styles.infos}>
          <p className={styles.name}>{data.clothing.nome}</p>
          <p className={styles.price}>R${data.clothing.preco}0</p>
          <p className={styles.description}>{data.clothing.descricao}</p>
          <div className={styles.gender}>
            <p>genêro</p>
            <p>{data.clothing.sexo == "M" ? "masculino" : data.clothing.sexo == "F" ? "feminino": "unissex"}</p>
          </div>
          <div className={styles.sizes}>
            <p>tamanhos</p>
            {color != null && 
            data?.clothing?.inventario.map((inventory) => {
              let items: ReactNode[] = []
              if (inventory.cor == color) {
                if (inventory["p"] != 0) {
                  items.push(
                    <label className={size == "p" ? styles.selected : ""} key={"p"}>
                      <input type="radio" value="p" name="size" onClick={(() => setSize("p"))} />
                      P
                    </label>
                  )
                }
                if (inventory["m"] != 0) {
                  items.push(
                    <label className={size == "m" ? styles.selected : ""} key={"m"}>
                      <input type="radio" value="m" name="size" onClick={(() => setSize("m"))} />
                      M
                    </label>
                  )
                }
                if (inventory["g"] != 0) {
                  items.push(
                    <label className={size == "g" ? styles.selected : ""} key={"g"}>
                      <input type="radio" value="g" name="size" onClick={(() => setSize("g"))} />
                      G
                    </label>
                  )
                }
                if (inventory["gg"] != 0) {
                  items.push(
                    <label className={size == "gg" ? styles.selected : ""} key={"gg"}>
                      <input type="radio" value="gg" name="size" onClick={(() => setSize("gg"))} />
                      GG
                    </label>
                  )
                }
              }
              return items
            })}
            </div>
            <div className={styles.category}>
              <p>categoria</p>
              <p>{data.clothing.categoria}</p>
            </div>
            <div className={styles.counter}>
              <p>quantidades</p>
              <button className={styles.more} onClick={handleCount} ></button>
              <p>{count}</p>
              <button className={styles.less} onClick={handleCount} ></button>
            </div>
            <div className={styles.material}>
              <p>material</p>
              <p>{data.clothing.material}</p>
            </div>
            <div className={styles.colors}>
              <p>cores</p>
              <button onClick={handleClick} ref={buttonToOpenModalRef}>
                <p>{color}</p>
                <span className={styles.expand}></span>
              </button>
            </div>
            <button className={styles.addPurchase}><Shop src={"/img/shop.png"} alt="" width={14} height={17}/><p>adicionar a bolsa</p></button>
          </div>
        : <div className={stylesLoad.infos}>
          <Skeleton className={stylesLoad.name}/>
          <Skeleton className={stylesLoad.price}/>
          <Skeleton className={stylesLoad.content}/>
        </div>}
      </section>
    </>
  )
}