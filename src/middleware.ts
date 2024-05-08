import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const url = new URL(request.url)
  if(url.pathname == "/auth/validar-contato") {
    return SendContactValidationCodeURL(request)
  }
  if(url.pathname == "/auth/criar-dois-fatores") {
    return SendCreateTwoAuthCodeURL(request)
  }
  if(url.pathname == "/auth/entrar") {
    return SigninURL(request)
  }
  if(url.pathname == "/auth/validar-codigo-dois-fatores") {
    return CheckTwoAuthCodeURL(request)
  }
  if(url.pathname == "/auth/resetar-senha") {
    return ResetPasswordURL(request)
  }
}

function SendContactValidationCodeURL(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/auth/entrar")
}

function SendCreateTwoAuthCodeURL(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/auth/entrar")
}

function SigninURL(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(!cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/")
}

function CheckTwoAuthCodeURL(request: NextRequest) {
  let cookie = request.cookies.get("userTwoAuth")
  if(cookie) {
    return NextResponse.next()
  }
  cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.redirect(request.nextUrl.origin+"/")
  }
  return NextResponse.redirect(request.nextUrl.origin+"/auth/entrar")
}

function ResetPasswordURL(request: NextRequest) {
  let cookie = request.cookies.get("userAuthResetPass")  
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/auth/entrar")
}

export const config = {
  matcher: ['/auth/validar-contato','/auth/criar-dois-fatores','/auth/entrar',
  '/auth/validar-codigo-dois-fatores','/auth/resetar-senha']
}