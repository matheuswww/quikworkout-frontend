'use client';

import GetAllClothing, {
 responseGetAllClothing,
} from '@/api/clothing/getAllClothing';
import styles from './allCollections.module.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SkeletonImage from '../skeletonImage/skeletonImage';
import formatPrice from '@/funcs/formatPrice';

interface props {
 cursor?: string;
 searchParams: {
  categoria?: string;
  material?: string;
  cor?: string;
  m?: string;
  f?: string;
  precoMaximo?: number;
  precoMinimo?: number;
 };
}

export default function LoadMore({ cursor,searchParams }: props) {
 const [data, setData] = useState<responseGetAllClothing | null>(null);
 const [load, setLoad] = useState<boolean>(false);
 const [newPage, setNewPage] = useState<boolean>(false);
 const [end, setEnd] = useState<boolean>(false);

 useEffect(() => {
  if (!end && !load) {
   (async function () {
    let newCursor = cursor;
    if (data?.clothing) {
     newCursor = data.clothing[data.clothing.length - 1].criadoEm;
    }
    setLoad(true);
    const res = await GetAllClothing({ cursor: newCursor, ...searchParams });
    if (res.status == 500 || res.status == 400) {
     setLoad(false);
     setNewPage(false);
     return;
    }
    if (res.status == 404) {
     setEnd(true);
    }
    if (res.clothing && data?.clothing && res.status == 200) {
     setData((d) => {
      const newD = d;
      if (res.clothing && data.clothing && newD?.clothing) {
       newD.clothing.push(...res.clothing);
      }
      return newD;
     });
    } else if (res?.clothing && res.status == 200) {
     setData(res);
    }
    setNewPage(false);
    setTimeout(() => {
     setLoad(false);
    }, 50);
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
   {data &&
    data.status != 400 &&
    data.status != 500 &&
    data.clothing &&
    data.clothing.map((clothing) => {
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
        key={clothing.id}
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
      );
     }
    })}
   {load && (
    <div className={styles.ldsRing} aria-label="carregando" tabIndex={0}>
     <div aria-hidden="true"></div>
     <div aria-hidden="true"></div>
     <div aria-hidden="true"></div>
     <div aria-hidden="true"></div>
    </div>
   )}
  </>
 );
}
