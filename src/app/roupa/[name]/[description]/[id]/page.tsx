import Clothing from "@/components/clothing/clothing"
import styles from './page.module.css'
import { Metadata } from "next"
import { request } from "http"

interface clothingProps {
  params: {
    id: string
    name: string
    description: string
    img: string
  },
  searchParams: {
    img: string
  }
}

export function generateMetadata({...props}: clothingProps): Metadata { 
  return {
    title: "Roupa "+props.params.name,
    description: decodeURIComponent(props.params.description),
    keywords: "roupa crossfit, roupa academia, crossfit, academia, "+props.params.name,
    openGraph: {
      title: "Roupa "+props.params.name,
      description: decodeURIComponent(props.params.description),
      images: atob(props.searchParams.img)
    }
  }
}

export default function Product({...props}: clothingProps) {
  return (
    <main className={styles.main}>
      <Clothing id={props.params.id}/>
    </main>
  )
}