import Collections from '@/components/collections/collections'
import styles from './page.module.css'
import AllCollections from '@/components/allCollections/allCollections'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Página inicial quikworkout, venha se vestir com estilo!',
  keywords: "quikworkout, crossfit, academia, roupa crossfit, roupa academia"
 }

export default function Home() { 
  return (
    <main className={styles.main}>
      <section className={styles.collections}>
        <Collections />
      </section>
      <section className={styles.allCollections}>
        <AllCollections />
      </section>
    </main>
  )
}