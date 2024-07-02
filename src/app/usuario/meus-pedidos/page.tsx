import MyOrder from "@/components/myOrder/myOrder";
import { cookies } from "next/headers";

export default function Page() {
  const cookieInfos = cookies().get("userProfile")

  return (
    <MyOrder cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
  )
}