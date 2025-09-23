import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// import { Montserrat } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { TenantProvider } from "@/contexts/TenantContext"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

// const montserrat = Montserrat({ 
//   subsets: ['latin'],
//   variable: '--font-montserrat',
// })

export const metadata: Metadata = {
  title: "TuriGest PMS",
  description: "Sistema de Gestión de Propiedades Turísticas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
      </head>
      <body className={``}>
        <TenantProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
