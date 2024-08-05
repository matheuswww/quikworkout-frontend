import Clothings from "@/components/manager/clothing/clothings";
import { cookies } from "next/headers";

export default function Page() {
  const cookieInfos = cookies().get("adminProfile")
  return (
    <Clothings cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value}/>
  )
}