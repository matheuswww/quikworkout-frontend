'use client';
import Link from 'next/link';
import styles from './collections.module.css';
import Slide from '@/funcs/slide';
import { useEffect, useRef } from 'react';
import SkeletonImage from '../skeletonImage/skeletonImage';
import Filter from '../allCollections/filter';

export default function Collections() {
 const slide = useRef<HTMLUListElement | null>(null);
 const wrapper = useRef<HTMLDivElement | null>(null);
 useEffect(() => {
  if (
   slide.current &&
   wrapper.current &&
   slide.current instanceof HTMLElement &&
   wrapper.current instanceof HTMLElement
  ) {
   new Slide(slide.current, wrapper.current);
  }
 }, []);

 return (
  <>
   <Filter />
   <section className={styles.collections}>
    <div
     className={styles.wrapper}
     ref={wrapper}
     aria-label="slide com diversas coleções de roupas"
    >
     <h2 className={styles.h2}>Coleções</h2>
     <ul className={styles.slide} ref={slide}>
      <li className={styles.product}>
       <Link className={styles.card} href="#">
        <p>Cropped</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_white.jpg"
         width={145}
         height={200}
         alt="mulher "
         className={styles.skeleton}
        />
       </Link>
      </li>
      <li className={styles.product}>
       <Link className={styles.card} href="#">
        <p>Cropped</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_black.jpg"
         width={145}
         height={200}
         alt="mulher "
         className={styles.skeleton}
        />
       </Link>
      </li>
      <li className={styles.product}>
       <Link className={styles.card} href="#">
        <p>Cropped</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_pink.jpg"
         width={145}
         height={200}
         alt="mulher "
         className={styles.skeleton}
        />
       </Link>
      </li>
      <li className={styles.product}>
       <Link className={styles.card} href="#">
        <p>Cropped</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_green.jpg"
         width={145}
         height={200}
         alt="mulher "
         className={styles.skeleton}
        />
       </Link>
      </li>
     </ul>
    </div>
   </section>
  </>
 );
}
