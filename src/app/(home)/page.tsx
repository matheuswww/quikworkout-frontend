import Collections from '@/components/collections/collections'
import styles from './page.module.css'

export default function Home() {

  return (
    <main className={styles.main}>
      <section className={styles.collections}>
        <Collections />
      </section>
    </main>
  )
}
