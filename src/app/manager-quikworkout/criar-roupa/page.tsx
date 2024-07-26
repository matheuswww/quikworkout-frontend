import CreateClothingForm from "@/components/manager/createClothing/createClothing";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata:Metadata = {
  title: "Criar nova roupa"
}

export default function CreateClothing() {
  const cookieInfos = cookies().get("adminProfile")
  return (
    <CreateClothingForm cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value}/>
  )
}