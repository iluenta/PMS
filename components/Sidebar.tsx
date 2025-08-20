"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import {
  Home,
  Building,
  Calendar,
  CheckSquare,
  Settings,
  Users,
  X,
  Globe,
  FileText,
  DollarSign,
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Propiedades', href: '/properties', icon: Building },
  { name: 'Reservas', href: '/bookings', icon: Calendar },
  { name: 'Calendario', href: '/property-calendar', icon: Calendar },
  { name: 'Canales de Distribución', href: '/property-channels', icon: Globe },
  { name: 'Pagos de Reservas', href: '/booking-payments', icon: FileText },
  { name: 'Gastos de Propiedades', href: '/property-expenses', icon: DollarSign },
  { name: 'Personas', href: '/people', icon: Users },
  { name: 'Reportes', href: '/reports', icon: CheckSquare },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-72 h-full
      `}>
        <div className="flex h-full w-72 flex-col bg-white border-r border-gray-200">
          {/* Header con logo TuriGest */}
          <div className="flex h-20 items-center justify-between px-8 border-b border-gray-200 bg-blue-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-white text-xl font-bold">TuriGest</h1>
            </div>
            
            {/* Botón cerrar para móvil */}
            <button
              onClick={close}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          
          {/* Navegación */}
          <nav className="flex-1 space-y-1 px-6 py-6">
            {navigation.map((item) => {
              // Dashboard está activo si estamos en / o en /dashboard
              const isActive = item.name === 'Dashboard' ? 
                (pathname === '/' || pathname === '/dashboard') : 
                pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => close()} // Cerrar sidebar en móvil al navegar
                  className={cn(
                    'flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn(
                    'mr-3 h-5 w-5 transition-all duration-200',
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Botón Cerrar Sesión */}
          <div className="p-6 border-t border-gray-200">
            <button className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group">
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
