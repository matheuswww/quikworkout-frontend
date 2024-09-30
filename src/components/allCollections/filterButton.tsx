'use client';
import { useRef } from 'react';
import styles from './filter.module.css';

export default function FilterButton() {
 const buttonRef = useRef<HTMLButtonElement | null>(null);
 function handleClick() {
  const form = document.querySelector('#filter');
  buttonRef.current instanceof HTMLButtonElement &&
   (buttonRef.current.disabled = true);
  if (form instanceof HTMLFormElement) {
   if (form.classList.contains(styles.active)) {
    return;
   }
   form.style.display = 'flex';
   setTimeout(() => {
    form.classList.add(styles.active);
    document.addEventListener('click', close);
    const sections = document.querySelectorAll('section');
    sections.forEach((el) => {
     el.style.transition = '.5s';
     el.style.opacity = '.1';
    });
    const header = document.querySelector('header');
    if (header instanceof HTMLElement) {
     header.style.transition = '.5s';
     header.style.opacity = '.1';
    }
   });
  }
 }

 function close(event: MouseEvent) {
  const form = document.querySelector('#filter');
  buttonRef.current instanceof HTMLButtonElement &&
   (buttonRef.current.disabled = false);
  if (form instanceof HTMLFormElement) {
   if (event.target instanceof HTMLElement) {
    if (
     form.contains(event.target) &&
     event.target.id != 'close' &&
     event.target.id != 'closeSpan'
    ) {
     return;
    }
    document.removeEventListener('click', close);
    form.classList.remove(styles.active);
    const sections = document.querySelectorAll('section');
    sections.forEach((el) => {
     el.style.opacity = '1';
    });
    const header = document.querySelector('header');
    header instanceof HTMLElement && (header.style.opacity = '1');
    setTimeout(() => {
     form.style.display = 'none';
    }, 500);
    return;
   }
  }
 }
 return (
  <button ref={buttonRef} className={styles.filterButton} onClick={handleClick}>
   Filtrar coleções
  </button>
 );
}
