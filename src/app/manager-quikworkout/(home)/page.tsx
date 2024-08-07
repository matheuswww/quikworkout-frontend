import GetOrderAdmin from "@/components/manager/getOrder/getOrder";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata:Metadata = {
  title: "Home"
}

interface props {
  searchParams: {
    updated: string
  }
}

export default function Page({...props}: props) {
  const cookieInfos = cookies().get("adminProfile")
  return (
    <GetOrderAdmin cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} updated={props.searchParams.updated}/>
  )
}