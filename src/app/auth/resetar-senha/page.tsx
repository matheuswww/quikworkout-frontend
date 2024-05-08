import ResetPasswordForm from "@/components/authForm/resetPasswordForm";
import { cookies } from "next/headers";

export default function SendCreateTwoAuthCode() {
  const cookieInfos = cookies().get("userAuthResetPass")

  return (
    <ResetPasswordForm cookieName={cookieInfos?.name} cookieVal={cookieInfos?.value} />
  )
}