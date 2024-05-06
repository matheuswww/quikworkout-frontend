import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const url = new URL(request.url)
  if(url.pathname == "/autenticacao/validar-contato") {
    return SendContactValidationCodeURL(request)
  }
  if(url.pathname == "/autenticacao/criar-dois-fatores") {
    return SendCreateTwoAuthCodeURL(request)
  }
}

function SendContactValidationCodeURL(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/autenticacao/entrar")
}

function SendCreateTwoAuthCodeURL(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/autenticacao/entrar")
}

export const config = {
  matcher: ['/autenticacao/validar-contato','/autenticacao/criar-dois-fatores']
}