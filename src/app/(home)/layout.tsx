import { Inter } from 'next/font/google'
import styles from './layout.module.css'
import Menu from '@/components/menu/menu'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
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
    </>
  )
}
