"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Building, 
  Filter, 
  Search, 
  Download, 
  Plus 
} from "lucide-react"
import type { Property } from "@/lib/supabase"

interface PropertyConfigProps {
  properties: Property[]
  selectedPropertyId: string
  onPropertyChange: (propertyId: string) => void
  selectedProperty?: Property | null
  onFilters?: () => void
  onSearch?: () => void
  onExport?: () => void
  onNewReservation?: () => void
}

export default function PropertyConfig({
  properties,
  selectedPropertyId,
  onPropertyChange,
  selectedProperty,
  onFilters,
  onSearch,
  onExport,
  onNewReservation
}: PropertyConfigProps) {
  return (
    <div className="space-y-4">
      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Seleccionar Propiedad
          </CardTitle>
          <CardDescription>
            Elige una propiedad para gestionar su calendario y disponibilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="property-select">Propiedad</Label>
            <Select value={selectedPropertyId} onValueChange={onPropertyChange}>
              <SelectTrigger className="w-full md:w-80">
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
            {selectedProperty && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Propiedad seleccionada:</strong> {selectedProperty.name}
                {selectedProperty.address && (
                  <span className="block text-xs text-gray-500">
                    {selectedProperty.address}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        <Button variant="outline" size="sm" onClick={onSearch}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button size="sm" onClick={onNewReservation}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>
    </div>
  )
} 