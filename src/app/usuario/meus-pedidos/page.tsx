import MyOrder from "@/components/myOrder/myOrder";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata:Metadata = {
  title: "Meus pedidos",
  description: "meus pedidos",
  keywords: "pedidos, meus pedidos, quikworkout",
  openGraph: {
    title: "Meus pedidos",
    description: "meus pedidos",
  }
}

export default function Page() {
  const cookieInfos = cookies().get("userProfile")

  return (
    <MyOrder cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
  )
}