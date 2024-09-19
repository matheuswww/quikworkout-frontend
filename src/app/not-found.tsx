import { Metadata } from 'next';
import styles from './notFound.module.css';
import Link from 'next/link';
import Icon from 'next/image';

export const metadata: Metadata = {
 title: 'Página não encontrada',
 description: 'página não encontrada',
};

export default function NotFound() {
 return (
  <div className={styles.wrapper}>
   <h1 className={styles.notFound}>
    Not found 404{' '}
    <Icon
     width={26}
     height={26}
     alt="lupa"
     src="/img/search.png"
     loading="lazy"
    />
   </h1>
   <p className={styles.message}>Esta página não foi encontrada</p>
   <Link href="/" className={styles.backHome}>
    Voltar para home
   </Link>
  </div>
 );
}
