import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const url = new URL(request.url)
  if(
    url.pathname == "/auth/entrar"
  ) {
    return CheckUserProfileCookieNotExist(request)
  }
  if(
    url.pathname == "/usuario/minha-bolsa" ||
    url.pathname == "/finalizar-compra" ||
    url.pathname == "/usuario/meus-pedidos" ||
    url.pathname == "/usuario/minha-conta" ||
    url.pathname == "/auth/criar-dois-fatores"
    ) {
    return CheckUserProfileCookieExist(request)
  }
  if(url.pathname == "/auth/validar-codigo-dois-fatores") {
    return CheckTwoAuthCodeURL(request)
  }
  if(url.pathname == "/auth/resetar-senha") {
    return ResetPasswordURL(request)
  }
  if(url.pathname == "/manager-quikworkout/criar-roupa") {
    return CheckAdminProfileExist(request)
  }
}

function CheckAdminProfileExist(request: NextRequest) {
  const cookie = request.cookies.get("adminProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/manager-quikworkout/auth")
}

function CheckUserProfileCookieNotExist(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(!cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/")
}

function CheckUserProfileCookieExist(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/auth/entrar")
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
  matcher: ['/auth/criar-dois-fatores','/auth/entrar',
  '/auth/validar-codigo-dois-fatores','/auth/resetar-senha', 
  '/usuario/minha-bolsa', '/finalizar-compra', 
  '/usuario/meus-pedidos','/usuario/minha-conta',
  '/manager-quikworkout/criar-roupa']
}