import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import styles from './layout.module.css'
import Line from 'next/image'
import Menu from '@/components/menu/menu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Home',
  description: 'página inicial quikworkout',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="PT-BR">
      <body>
        <Menu />
        <header className={styles.header}>
          <h1 className={styles.h1}>
          <span className={styles.phrase1}>mais estilo <br /> mais</span>
          <span className={styles.line}></span>
          <span className={styles.phrase2}> quik <br /> workout</span>
         </h1>
         <button className={styles.button}>faça seu estilo</button>
        </header>
        {children}
      </body>
    </html>
  )
}
