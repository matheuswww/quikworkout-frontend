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
  const indexImages = useRef<HTMLDivElement | null>(null)

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
      slide.current.style.transform = `translate3d(0px,0,0)`
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
    <section>
     {data?.status == 404 && notFound()}
     <div className={`${styles.indexImages} ${data?.clothing && styles.loading}`} ref={indexImages} >
     {data?.clothing ? data.clothing.inventario.map(({ images, imgDesc, cor }) => {
        return (
          (color == cor && windowWidth) &&
            images?.map(( src, index ) => {
                return (
                  <li key={src}>
                    { <SkeletonImage src={src} id={index.toString()} alt={imgDesc} width={290} height={460} key={data.clothing?.id} className={index == 0 ? styles.activeThumb : ""} draggable={false}/> }
                  </li>
                )
              })
            )
        }) : <div className={stylesLoad.indexImages}><Skeleton/></div>}
      </div>
      {data?.clothing ? <div className={styles.images} ref={images}>
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
              <button className={styles.more} onClick={handleCount}></button>
              <p>{count}</p>
              <button className={styles.less} onClick={handleCount}></button>
            </div>
            <div className={styles.material}>
              <p>material</p>
              <p>{data.clothing.material}</p>
            </div>
            <div className={styles.colors}>
              <p>cores</p>
              <select onChange={((event: SyntheticEvent) => event.currentTarget instanceof HTMLSelectElement && setColor(event.currentTarget.value))}>
                {mainColor &&  <option value={mainColor} key={mainColor}>{mainColor}</option>}
                {data.clothing.inventario.map(({cor,corPrincipal}) => {
                  if (corPrincipal && color == null) {
                    setColor(cor)
                    setMainColor(cor)
                  }
                  return !corPrincipal && <option value={cor} key={cor}>{cor}</option>
                })}
              </select>
            </div>
            <button className={styles.addPurchase}><Shop src={"/img/shop.png"} alt="" width={14} height={17}/><p>adicionar a bolsa</p></button>
          </div>
        : <div className={stylesLoad.infos}>
          <Skeleton className={stylesLoad.name}/>
          <Skeleton className={stylesLoad.price}/>
          <Skeleton className={stylesLoad.content}/>
        </div>}
      </section>
  )
}