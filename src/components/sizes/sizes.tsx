import { ReactNode } from 'react'
import styles from './sizes.module.css'
import { inventario } from '@/api/clothing/getClothing'

interface props {
  setSize: React.Dispatch<React.SetStateAction<"p" | "m" | "g" | "gg" | "">>
  size: "p" | "m" | "g" | "gg" | ""
  inventory: sizesParams[] | undefined
  color: string | null
}

export interface sizesParams {
  cor: string
  p: number,
  m: number,
  g: number,
  gg: number,
}

export default function Sizes({setSize, size, color, inventory}:props) {
  return (
    (color != null && inventory) && 
      inventory.map((i) => {
        const items: ReactNode[] = []
        if (i.cor == color) {
          if (i["p"] != 0) {
            items.push(
              <label className={`${styles.label} ${size == "p" ? styles.selected : ""}`} key={"p"}>
                <input type="radio" className={styles.input} value="p" name="size" onClick={(() => setSize("p"))} aria-label="p"/>
                <span aria-hidden="true">p</span>
              </label>
            )
          }
          if (i["m"] != 0) {
            items.push(
              <label className={`${styles.label} ${size == "m" ? styles.selected : ""}`} key={"m"} >
                <input type="radio" className={styles.input} value="m" name="size" onClick={(() => setSize("m"))} aria-label="m"/>
                <span aria-hidden="true">m</span>
              </label>
            )
          }
          if (i["g"] != 0) {
            items.push(
              <label className={`${styles.label} ${size == "g" ? styles.selected : ""}`} key={"g"} >
                <input type="radio" className={styles.input} value="g" name="size" onClick={(() => setSize("g"))} aria-label="g"/>
                <span aria-hidden="true">g</span>
              </label>
            )
          }
          if (i["gg"] != 0) {
            items.push(
              <label className={`${styles.label} ${size == "gg" ? styles.selected : ""}`} key={"gg"} >
                <input type="radio" className={styles.input} value="gg" name="size" onClick={(() => setSize("gg"))} aria-label="gg"/>
                <span aria-hidden="true">gg</span>
              </label>
            )
          }
        }
        return items
      })
  )
}