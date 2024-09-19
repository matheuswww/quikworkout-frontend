import { MouseEventHandler } from 'react';
import styles from './back.module.css';
import BackImg from 'next/image';

interface props {
 handleBack: MouseEventHandler<HTMLButtonElement> | undefined;
 ariaLabel: string;
}

export default function Back({ handleBack, ariaLabel }: props) {
 return (
  <div className={styles.back}>
   <button
    type="button"
    id="button"
    className={styles.button}
    aria-label={ariaLabel}
    onClick={handleBack}
   >
    <BackImg
     alt="seta para o lado esquerdo"
     src="/img/back.png"
     width={16}
     height={16}
    />
   </button>
   <label htmlFor="button" className={styles.label}>
    {ariaLabel}
   </label>
  </div>
 );
}
