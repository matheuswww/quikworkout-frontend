import './globals.css'


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
