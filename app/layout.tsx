import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"

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
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
