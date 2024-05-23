import { MouseEventHandler } from 'react'
import styles from './counter.module.css'

interface props {
  handleCount: MouseEventHandler<HTMLButtonElement>
  count: number
}

export default function Counter({...props}: props) {
  return (
    <>
      <button className={styles.more} id="more" type="button" onClick={props.handleCount} aria-label="adicionar uma unidade de roupa"></button>
      <p className={styles.count}>{props.count}</p>
      <button className={styles.less} id="less" type="button" onClick={props.handleCount} aria-label="retirar uma unidade de roupa"></button>
    </>
  )
}