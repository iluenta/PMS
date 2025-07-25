"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Home,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bed,
  Globe,
  Percent,
  Receipt,
  DollarSign,
  BookOpen,
  CalendarCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Propiedades", href: "/properties", icon: Building2 },
  { name: "Reservas", href: "/bookings", icon: Bed },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Disponibilidad", href: "/availability", icon: CalendarCheck },
  { name: "Huéspedes", href: "/guests", icon: Users },
  { name: "Tarifas", href: "/pricing", icon: CreditCard },
  { name: "Canales", href: "/channels", icon: Globe },
  { name: "Comisiones", href: "/commission-settings", icon: Percent },
  { name: "Pagos Reservas", href: "/booking-payments", icon: DollarSign },
  { name: "Gastos", href: "/property-expenses", icon: Receipt },
  { name: "Guía Viajero", href: "/traveler-guide-management", icon: BookOpen },
  { name: "Reportes", href: "/reports", icon: BarChart3 },
  { name: "Configuración", href: "/settings", icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent pathname={pathname} signOut={signOut} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-1 flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} signOut={signOut} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">PMS Turístico</h1>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm text-gray-700 mr-4">{user?.email}</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ pathname, signOut }: { pathname: string; signOut: () => void }) {
  return (
    <>
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">PMS</span>
        </div>

        {/* Demo Guide Link */}
        <div className="px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/demo-guide", "_blank")}
            className="w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Ver Guía Demo
          </Button>
        </div>

        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          onClick={signOut}
          className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 w-full justify-start"
        >
          <LogOut className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  )
}
