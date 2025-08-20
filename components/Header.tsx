"use client"

import { PropertySelector } from '@/components/PropertySelector'
import { Menu, User, Building2 } from 'lucide-react'
import { useProperty } from '@/hooks/useProperty'
import { Skeleton } from '@/components/ui/skeleton'

export function Header() {
  const { selectedProperty, loading } = useProperty()

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/20 bg-white/60 backdrop-blur-xl px-4 md:px-8 shadow-lg">
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Botón hamburguesa para móvil */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/80 transition-all duration-200"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        
        {/* Selector de Propiedades */}
        <div className="hidden sm:block">
          <PropertySelector variant="compact" className="max-w-xs" />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Propiedad Seleccionada Info */}
        {loading ? (
          <div className="hidden md:flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
          </div>
        ) : selectedProperty ? (
          <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{selectedProperty.name}</span>
          </div>
        ) : null}
        
        {/* Avatar simplificado */}
        <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-blue-200">
          <User className="h-5 w-5 text-white" />
        </div>
      </div>
    </header>
  )
}
