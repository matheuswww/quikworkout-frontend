
import { Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  userScalable: false
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
