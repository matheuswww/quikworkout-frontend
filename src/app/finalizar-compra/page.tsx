import FinishPurchaseForm from "@/components/finishOrder/finishOrderForm";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata:Metadata = {
  title: "Finalizar compra",
  description: "Finalizar compra",
  openGraph: {
    title: "Finalizar compra",
    description: "Finalizar compra"
  }
}

interface props {
  searchParams: {
    page: number
    clothing_id: string
    color: string
    size: string
  }

}

export default function FinishPurchase({searchParams}: props) {
  const cookieInfos = cookies().get("userProfile")

  return (
    <FinishPurchaseForm cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} page={searchParams.page} clothing_id={searchParams.clothing_id} color={searchParams.color} size={searchParams.size}/>
  )
}