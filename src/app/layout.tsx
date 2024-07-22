
import { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  userScalable: false
}

export const metadata:Metadata = {
  icons: {
    icon: "/img/favicon.ico"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="PT-BR">
      <body className="body">
        {children}
      </body>
    </html>
  )
}
