import SendCreateTwoAuthCodeForm from "@/components/authForm/sendCreateTwoAuthCodeForm";
import { cookies } from "next/headers";

export default function SendCreateTwoAuthCode() {
  const cookieInfos = cookies().get("userProfile")

  return (
    <SendCreateTwoAuthCodeForm cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
  )
}