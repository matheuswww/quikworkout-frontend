import GetClothingCartForm from "@/components/getClothingCart/getClothingCartForm";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata:Metadata = {
  title: "Minha bolsa",
  description: "produtos adicionados a bolsa",
  keywords: "bolsa, bolsa quikworkout, carrinho, carrinho quikworkout, quikworkout",
  openGraph: {
    title: "Minha bolsa",
    description: "produtos adicionados a bolsa",
  }
}

export default function GetClothingCart() {
  const cookieInfos = cookies().get("userProfile")

  return <GetClothingCartForm cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
}