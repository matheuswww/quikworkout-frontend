'use client';
import styles from './page.module.css';
export default function MakeYourSyle() {
 function handleClick() {
  const main = document.querySelector('main');
  if (main instanceof HTMLElement) {
   main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 }
 return (
  <button className={styles.button} onClick={handleClick}>
   Faça seu estilo
  </button>
 );
}
