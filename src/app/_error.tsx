import Icon from 'next/image'
import styles from './error.module.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Erro',
  description: 'Erro ao carregar página',
}

export default function InternalServerError() {
  return (
    <div className={styles.wrapper} >
     <div>
      <h1 className={styles.internalServerError}>
          Internal server error 500
        <Icon alt="icone de aviso" src="/img/serverError.png" width={31} height={24} loading='lazy' />
        </h1>
        <p className={styles.message}>Oops, desculpe! Parece que houve um erro com nossos servidores</p>
     </div>
    </div>
  )
}