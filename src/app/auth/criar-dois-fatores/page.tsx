import SendCreateTwoAuthCodeForm from "@/components/authForm/sendCreateTwoAuthCodeForm";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: 'Criar autenticação de dois fatores',
  description: 'criação de autenticação de dois fatores',
  keywords: "criar dois fatores, quikworkout, criar dois fatores quikworkout, email, senha, autenticação dois fatores email, autenticação dois fatores senha"
}

export default function SendCreateTwoAuthCode() {
  const cookieInfos = cookies().get("userProfile")

  return (
    <SendCreateTwoAuthCodeForm cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
  )
}