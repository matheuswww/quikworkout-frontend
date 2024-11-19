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
       <Link className={styles.card} href="/roupa/Regatinha%20Pry/Regatinha%20malha%20canelada%20em%20poliamida%20com%20forro/ae62b558-46db-414b-a820-ee156fb8377d?img=aHR0cHM6Ly9iYWNrZW5kLnF1aWt3b3Jrb3V0LmNvbS5ici9pbWFnZXMvYWU2MmI1NTgtNDZkYi00MTRiLWE4MjAtZWUxNTZmYjgzNzdkL1ByZXRhL1ByZXRhMC5qcGVn">
        <p>Regatinhas Pry</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_white.jpg"
         width={600}
         height={900}
         alt="mulher olhando para a câmera com uma regata branca"
         className={styles.skeleton}
        />
       </Link>
      </li>
      <li className={styles.product}>
       <Link className={styles.card} href="/roupa/Regatinha%20Pry/Regatinha%20malha%20canelada%20em%20poliamida%20com%20forro/ae62b558-46db-414b-a820-ee156fb8377d?img=aHR0cHM6Ly9iYWNrZW5kLnF1aWt3b3Jrb3V0LmNvbS5ici9pbWFnZXMvYWU2MmI1NTgtNDZkYi00MTRiLWE4MjAtZWUxNTZmYjgzNzdkL1ByZXRhL1ByZXRhMC5qcGVn">
        <p>Regatinhas Pry</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_black.jpg"
         width={600}
         height={900}
         alt="mulher olhando para a câmera com uma regata preta"
         className={styles.skeleton}
        />
       </Link>
      </li>
      <li className={styles.product}>
       <Link className={styles.card} href="https://quikworkout.com.br/roupa/Regatinha%20Pry/Regatinha%20malha%20canelada%20em%20poliamida%20com%20forro/ae62b558-46db-414b-a820-ee156fb8377d?img=aHR0cHM6Ly9iYWNrZW5kLnF1aWt3b3Jrb3V0LmNvbS5ici9pbWFnZXMvYWU2MmI1NTgtNDZkYi00MTRiLWE4MjAtZWUxNTZmYjgzNzdkL1ByZXRhL1ByZXRhMC5qcGVn">
        <p>Regatinhas Pry</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_pink.jpg"
         width={600}
         height={900}
         alt="mulher olhando para a câmera com uma regata rosa"
         className={styles.skeleton}
        />
       </Link>
      </li>
      <li className={styles.product}>
       <Link className={styles.card} href="https://quikworkout.com.br/roupa/Regatinha%20Pry/Regatinha%20malha%20canelada%20em%20poliamida%20com%20forro/ae62b558-46db-414b-a820-ee156fb8377d?img=aHR0cHM6Ly9iYWNrZW5kLnF1aWt3b3Jrb3V0LmNvbS5ici9pbWFnZXMvYWU2MmI1NTgtNDZkYi00MTRiLWE4MjAtZWUxNTZmYjgzNzdkL1ByZXRhL1ByZXRhMC5qcGVn">
        <p>Regatinhas Pry</p>
        <SkeletonImage
         draggable={false}
         src="/img/collection_green.jpg"
         width={600}
         height={900}
         alt="mulher olhando para a câmera com uma regata verde"
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