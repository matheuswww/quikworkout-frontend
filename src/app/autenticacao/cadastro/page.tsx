import Signup from "@/components/authForm/signup";
import { Metadata } from "next";

export const metadata:Metadata = {
  title: "Cadastro",
  description: "Efetuar cadastro na quikworkout",
  keywords: "login, login quikworkout, criar conta, criar conta quikworkout, quikworkout, cadastro, cadastro quikworkout",
  openGraph: {
    title: "Cadastro",
    description: "Efetuar cadastro na quikworkout",
    images: "/img/background-login.jpg"
  }
}

export default function Login() {
  return (
    <Signup />
  )
}