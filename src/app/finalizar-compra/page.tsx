import FinishPurchaseForm from "@/components/finishOrder/finishOrderForm";
import Footer from "@/components/footer/footer";
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
    retry_payment_id: string
    paymentType: string
  }
}

export default function FinishPurchase({searchParams}: props) {
  const cookieInfos = cookies().get("userProfile")
  
  return (
    <>
      <FinishPurchaseForm paymentType={searchParams.paymentType} cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} page={searchParams.page} clothing_id={searchParams.clothing_id} color={searchParams.color} size={searchParams.size} retryPayment={searchParams.retry_payment_id}/>
      <Footer />
    </>
  )
}