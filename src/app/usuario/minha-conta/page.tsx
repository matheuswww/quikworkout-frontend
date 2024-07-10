import MyAccount from "@/components/myAccount/myAccount";
import { cookies } from "next/headers";

export default function Page() {
  const cookieInfos = cookies().get("userProfile")

  return (
    <MyAccount cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
  )
}