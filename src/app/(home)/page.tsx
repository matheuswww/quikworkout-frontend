import Collections from '@/components/collections/collections';
import styles from './page.module.css';
import AllCollections from '@/components/allCollections/allCollections';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Menu from '@/components/menu/menu';
import Footer from '@/components/footer/footer';
import MakeYourSyle from './makeYourSytle';

export const metadata: Metadata = {
 title: 'Quikworkout',
 description: 'Página inicial quikworkout, venha se vestir com estilo!',
 keywords: 'quikworkout, crossfit, academia, roupa crossfit, roupa academia',
};

interface props {
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

export default function Home({ searchParams }: props) {
 const cookieInfos = cookies().get('userProfile');

 return (
  <>
   <header className={styles.header}>
    <Menu cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
    <h1 className={styles.h1}>
     <span className={styles.phrase1}>
      mais estilo <br /> mais
     </span>
     <span className={styles.line}></span>
     <span className={styles.phrase2}>
      {' '}
      quik <br /> workout
     </span>
    </h1>
    <MakeYourSyle />
   </header>
   <main className={styles.main}>
    <Collections />
    <AllCollections searchParams={searchParams} />
   </main>
   <Footer />
  </>
 );
}
