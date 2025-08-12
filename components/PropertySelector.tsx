"use client"

import { useState } from "react"
import { Building2, ChevronDown, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProperty } from "@/hooks/useProperty"

interface PropertySelectorProps {
  className?: string
  variant?: "default" | "compact"
}

export function PropertySelector({ className = "", variant = "default" }: PropertySelectorProps) {
  const { selectedProperty, properties, loading, setSelectedPropertyById } = useProperty()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Cargando propiedades...</span>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No hay propiedades</span>
      </div>
    )
  }

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyById(propertyId)
    setIsOpen(false)
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Building2 className="h-4 w-4 text-gray-400" />
        <Select value={selectedProperty?.id || ""} onValueChange={handlePropertyChange}>
          <SelectTrigger className="w-48 border-0 bg-transparent focus:ring-0">
            <SelectValue placeholder="Selecciona una propiedad" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Building2 className="h-4 w-4 text-gray-400" />
      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-500">Propiedad</label>
        <Select value={selectedProperty?.id || ""} onValueChange={handlePropertyChange}>
          <SelectTrigger className="w-48 border-0 bg-transparent focus:ring-0">
            <SelectValue placeholder="Selecciona una propiedad" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
