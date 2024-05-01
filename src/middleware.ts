import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const url = new URL(request.url)
  if(url.pathname == "/autenticacao/enviar-codigo-contato") {
    return SendContactValidationCodeURL(request)
  }
}

function SendContactValidationCodeURL(request: NextRequest) {
  const cookie = request.cookies.get("userProfile")
  if(cookie) {
    return NextResponse.next()
  }
  return NextResponse.redirect(request.nextUrl.origin+"/autenticacao/entrar")
}


export const config = {
  matcher: ['/autenticacao/enviar-codigo-contato','/autenticacao/validar-codigo-contato']
}