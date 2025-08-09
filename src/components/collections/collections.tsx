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
     <h2 className={styles.h2}>Nova Coleção</h2>
     <ul className={styles.slide} ref={slide}>
      <li className={styles.product}>
       <Link className={styles.card} href="/roupa/Games/Camiseta%20para%20participar%20do%20quikworkout%20games!/b9c39e96-1296-4901-aefc-3a5d23f22e09?img=aHR0cHM6Ly9iYWNrZW5kLnF1aWt3b3Jrb3V0LmNvbS5ici9pbWFnZXMvYjljMzllOTYtMTI5Ni00OTAxLWFlZmMtM2E1ZDIzZjIyZTA5L1ByZXRhL1ByZXRhMC5qcGVn">
        <p>Games</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_games.jpeg"
         width={600}
         height={900}
         alt="Mulher com uma camiseta escrito quikworkout games"
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