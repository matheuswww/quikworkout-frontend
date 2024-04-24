import { MouseEventHandler, useEffect } from 'react'
import styles from  './popupError.module.css'

interface props {
  className?: string
  handleOut: MouseEventHandler<HTMLButtonElement>
}

export default function PopupError({className, handleOut}:props) {

  useEffect(() => {
    document.body.focus()
  }, [])

  return (
    <div className={`${styles.container} ${className && className} ${styles.active}`}>
      <p tabIndex={0}>Oops! Parece que houve um erro, tente novamente</p>
      <button tabIndex={0} aria-label="fechar" onClick={handleOut}><span aria-hidden="true">x</span></button>
    </div>
  )
}