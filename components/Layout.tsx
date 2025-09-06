"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { PropertyProvider, useProperty } from "@/contexts/PropertyContext"
import { PropertySelector } from "@/components/PropertySelector"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useTenantSync } from "@/hooks/useTenantSync"
import { useTenant } from "@/contexts/TenantContext"
import {
  Menu,
  X,
  Home,
  Building2,
  Calendar,
  Users,
  CreditCard,
  Receipt,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Globe,
  User,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Propiedades", href: "/properties", icon: Building2 },
  { name: "Reservas", href: "/bookings", icon: BookOpen },
  { name: "Calendario", href: "/property-calendar", icon: Calendar },
  { name: "Canales de Distribución", href: "/property-channels", icon: Globe },
  { name: "Pagos de Reservas", href: "/booking-payments", icon: CreditCard },
  { name: "Gastos de Propiedades", href: "/property-expenses", icon: Receipt },
  { name: "Personas", href: "/people", icon: Users },
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header con logo TuriGest */}
      <div className="flex h-20 items-center justify-between px-8 border-b border-gray-200 bg-blue-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">TuriGest</h1>
        </div>
      </div>
      
      {/* Navegación */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="px-6 space-y-1">
          {navigation.map((item) => {
            // Dashboard está activo si estamos en / o en /dashboard
            const isActive = item.name === 'Dashboard' ? 
              (pathname === '/' || pathname === '/dashboard') : 
              pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onLinkClick}
                className={`flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Botón Cerrar Sesión */}
      <div className="p-6 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

function HeaderContent({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const { user, signOut } = useAuth()
  const { tenant, loading } = useTenant()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/20 bg-white/60 backdrop-blur-xl px-4 md:px-8 shadow-lg">
      <div className="flex items-center space-x-4 md:px-6">
        {/* Botón hamburguesa para móvil */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden p-2 rounded-lg hover:bg-white/80 transition-all duration-200"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>
        
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        
        {/* Selector de Propiedades */}
        <div className="hidden sm:block">
          <PropertySelector variant="compact" className="max-w-xs" />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Tenant Info */}
        {loading ? (
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : tenant ? (
          <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{tenant.name}</span>
          </div>
        ) : null}
        
        {/* Avatar del usuario con dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-200 cursor-pointer hover:ring-blue-300 transition-all duration-200">
              <User className="h-5 w-5 text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Usuario'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useAuthRedirect()
  useTenantSync() // Sincronizar tenant con usuario autenticado

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
    <PropertyProvider>
      <div className="flex min-h-screen w-full bg-gray-100/40">
        {/* Desktop Sidebar - FIJO EN DESKTOP */}
        <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:z-20">
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

        {/* Content Area */}
        <div className="flex flex-col flex-1 lg:pl-72">
          <HeaderContent onMobileMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="flex-1 space-y-4 p-4 lg:p-6">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </PropertyProvider>
  )
}
