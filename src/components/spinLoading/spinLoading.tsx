import { useEffect } from 'react';
import styles from './spinLoading.module.css';

export default function SpinLoading() {
 useEffect(() => {
  document.body.focus();
 }, []);

 return (
  <div className={styles.ldsRing} aria-label="carregando" tabIndex={0}>
   <div aria-hidden="true"></div>
   <div aria-hidden="true"></div>
   <div aria-hidden="true"></div>
   <div aria-hidden="true"></div>
   <p>Aguarde...</p>
  </div>
 );
}
