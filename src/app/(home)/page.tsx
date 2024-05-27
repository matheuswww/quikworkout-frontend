import Collections from '@/components/collections/collections'
import styles from './page.module.css'
import AllCollections from '@/components/allCollections/allCollections'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Página inicial quikworkout, venha se vestir com estilo!',
  keywords: "quikworkout, crossfit, academia, roupa crossfit, roupa academia"
}

interface props {
  searchParams: {
    categoria?: string
    material?: string
    cor?: string
    m?: string
    f?: string
    precoMaximo?: number
    precoMinimo?: number
  }
}

export default function Home({searchParams}: props) { 
  return (
    <main className={styles.main}>
      <Collections />
      <AllCollections searchParams={searchParams} />
    </main>
  )
}