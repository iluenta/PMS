"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import {
  Menu,
  X,
  Home,
  Building2,
  Bed,
  Calendar,
  CalendarCheck,
  Users,
  CreditCard,
  DollarSign,
  Receipt,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Share2,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Propiedades", href: "/properties", icon: Building2 },
  { name: "Reservas", href: "/bookings", icon: Bed },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Disponibilidad", href: "/availability", icon: CalendarCheck },
  { name: "Huéspedes", href: "/guests", icon: Users },
  { name: "Tarifas", href: "/pricing", icon: CreditCard },
  { name: "Pagos Reservas", href: "/booking-payments", icon: DollarSign },
  { name: "Gastos", href: "/property-expenses", icon: Receipt },
  { name: "Canales Distribución", href: "/property-channels", icon: Share2 },
  { name: "Guía Viajero", href: "/traveler-guide-management", icon: BookOpen },
  { name: "Reportes", href: "/reports", icon: BarChart3 },
  { name: "Configuración", href: "/settings", icon: Settings },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    if (onLinkClick) onLinkClick()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r">
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold">TuriGest</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary ${
                pathname === item.href ? "bg-gray-100 text-primary" : ""
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useAuthRedirect()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100/40">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-72">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-72 max-w-[calc(100%-3rem)] flex-1 flex-col bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-6">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menú</span>
          </Button>
          <div className="flex-1">
            {/* Header content can go here */}
          </div>
          <span className="text-sm text-gray-500 hidden sm:inline">
            {user.email}
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
