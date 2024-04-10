import Clothing from "@/components/clothing/clothing"
import styles from './page.module.css'

interface clothingProps {
  params: {
    id: string
  }
}

export default function Product({...props}: clothingProps) {
  return (
    <main className={styles.main}>
      <Clothing id={props.params.id}/>
    </main>
  )
}