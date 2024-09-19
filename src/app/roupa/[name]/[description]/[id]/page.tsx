import { api } from "@/api/path"
import Clothing from "@/components/clothing/clothing"
import Footer from "@/components/footer/footer"
import { Metadata } from "next"
import { cookies } from "next/headers"

interface clothingProps {
  params: {
    id: string
    name: string
    description: string
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
      images: atob(props.searchParams.img).startsWith(api) ? atob(props.searchParams.img) : undefined
    }
  }
}

export default function Product({...props}: clothingProps) {
  const cookieInfos = cookies().get("userProfile")
  return (
    <>
      <Clothing id={props.params.id} cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value}/>
      <Footer />
    </>
  )
}