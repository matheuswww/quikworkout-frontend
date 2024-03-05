import Collections from '@/components/collections/collections'
import styles from './page.module.css'
import AllCollections from '@/components/allCollections/allCollections'

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
