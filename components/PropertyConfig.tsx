"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Building
} from "lucide-react"
import type { Property } from "@/lib/supabase"

interface PropertyConfigProps {
  properties: Property[]
  selectedPropertyId: string
  onPropertyChange: (propertyId: string) => void
  selectedProperty?: Property | null
}

export default function PropertyConfig({
  properties,
  selectedPropertyId,
  onPropertyChange,
  selectedProperty
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
    </div>
  )
} 