'use client';
import Link from 'next/link';
import styles from './clothingSlide.module.css';
import Slide from '@/funcs/slide';
import { useEffect, useRef, useState } from 'react';
import SkeletonImage from '../skeletonImage/skeletonImage';
import GetAllClothing, {
 responseGetAllClothing,
} from '@/api/clothing/getAllClothing';
import formatPrice from '@/funcs/formatPrice';
import { getClothingByIdResponse } from '@/api/clothing/getClothing';
import Skeleton from '../skeleton/skeleton';

interface props {
 clothing: getClothingByIdResponse | null;
}

export default function ClothingSlide({ clothing }: props) {
 const [data, setData] = useState<responseGetAllClothing | null>(null);
 const [load, setLoad] = useState<boolean>(true);
 const [section, setSection] = useState<HTMLElement | null>(null);
 const slide = useRef<HTMLUListElement | null>(null);
 const wrapper = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
  (async function () {
   if (clothing?.clothing) {
    const sectionEl = document.querySelector('section');
    if (sectionEl instanceof HTMLElement && !section) {
     setSection(sectionEl);
    }
    let category: string | undefined = undefined;
    let material: string | undefined = undefined;
    let gender: string | undefined = undefined;
    const randomVal = Math.random();
    if (randomVal < 1 / 3) {
     category = clothing.clothing.categoria;
    } else if (randomVal < 2 / 3) {
     material = clothing.clothing.material;
    } else {
     gender = clothing.clothing.sexo.toUpperCase();
    }
    const res = await GetAllClothing({
     limite: 6,
     categoria: category,
     material: material,
     sexo: gender,
    });

    if (res.clothing) {
     res.clothing.sort(() => Math.random() - 0.5);
     res.clothing = res.clothing.filter((d) => {
      if (d.id == clothing.clothing?.id) {
       return false;
      }
      return true;
     });
     if (res.clothing.length == 0) {
      res.clothing = null;
      res.status = 404;
     }
    }
    setData(res);
    if (res.status == 200) {
     if (section instanceof HTMLElement) {
      section.style.marginTop = 'revert-layer';
     }
    }
    if (res.status == 404 || res.status == 500) {
     setTimeout(() => {
      setLoad(false);
      if (window.innerWidth > 800) {
       if (section instanceof HTMLElement) {
        section.style.marginTop = '0px';
       }
      }
     }, 600);
     return;
    }
    setLoad(false);
   }
  })();
 }, [clothing]);

 useEffect(() => {
  if (
   slide.current &&
   wrapper.current &&
   slide.current instanceof HTMLElement &&
   wrapper.current instanceof HTMLElement
  ) {
   new Slide(slide.current, wrapper.current);
  }
 }, [data]);

 return (
  <>
   {data?.status == 200 && !load ? (
    <div className={styles.content}>
     <div
      className={styles.wrapper}
      ref={wrapper}
      aria-label="slide com diversas coleções de roupas"
     >
      <h2 className={styles.h2}>Você também pode se interessar</h2>
      <ul className={styles.slide} ref={slide}>
       {data.clothing?.map((clothing) => {
        if (clothing.inventario[0].images == null) {
         return null;
        }
        let indexInventory: number = 0;
        const images = clothing.inventario.find((item, i) => {
         indexInventory = i;
         return item.corPrincipal;
        })?.images;
        const image = images?.length ? btoa(images[0]) : '';
        if (images) {
         return (
          <li key={clothing.id}>
           <Link
            href={
             '/roupa/' +
             clothing.nome +
             '/' +
             clothing.descricao +
             '/' +
             clothing.id +
             '?img=' +
             image
            }
            style={{ display: 'block' }}
            className={styles.card}
           >
            <SkeletonImage
             src={images[0]}
             alt={clothing.inventario[indexInventory].imgDesc}
             width={225}
             height={300}
             className={styles.clothing}
            />
            <div className={styles.clothingInfos}>
             <p className={styles.name}>{clothing.nome}</p>
             <p className={styles.price}>R${formatPrice(clothing.preco)}</p>
            </div>
           </Link>
          </li>
         );
        }
       })}
      </ul>
     </div>
    </div>
   ) : (
    load && (
     <div aria-label="carregando">
      <Skeleton
       className={`${styles.load} ${(data?.status == 404 || data?.status == 500) && styles.out}`}
      />
     </div>
    )
   )}
  </>
 );
}
