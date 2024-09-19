'use cliemt';
import styles from './success.module.css';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface props {
 setSuccess: Dispatch<SetStateAction<boolean>>;
 success: boolean;
 msg: string;
}

export default function Success({ setSuccess, success, msg }: props) {
 const divRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
  if (success) {
   if (divRef.current instanceof HTMLDivElement) {
    divRef.current.focus();
    divRef.current.style.display = 'flex';
    setTimeout(() => {
     divRef.current?.classList.add(styles.active);
     setTimeout(() => {
      divRef.current?.classList.remove(styles.active);
      setTimeout(() => {
       setSuccess(false);
      }, 1200);
     }, 1200);
    }, 100);
   }
  }
 }, [success]);

 return (
  <div tabIndex={0} className={styles.container} ref={divRef}>
   <p>{msg}</p>
  </div>
 );
}
