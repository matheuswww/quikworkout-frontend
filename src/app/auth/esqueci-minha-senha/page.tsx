import SendForgotPasswordCodeForm from "@/components/authForm/sendForgotPasswordCodeForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Esqueci minha senha',
  description: 'enviar código para alteração de senha',
  keywords: "esqueci minha senha, quikworkout, esqueci minha senha quikworkout"
}

export default function ForgotPassword() {
  return (
    <SendForgotPasswordCodeForm />
  )
}