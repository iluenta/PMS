"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Building
} from "lucide-react"
import { useProperty } from "@/hooks/useProperty"
import type { Property } from "@/lib/supabase"

interface PropertyConfigProps {
  selectedProperty?: Property | null
}

export default function PropertyConfig({
  selectedProperty
}: PropertyConfigProps) {
  const { selectedProperty: contextProperty } = useProperty()
  const property = selectedProperty || contextProperty

  return (
    <div className="space-y-4">
      {/* Property Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Propiedad Seleccionada
          </CardTitle>
          <CardDescription>
            Propiedad actual para gestionar su calendario y disponibilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="property-display">Propiedad</Label>
            <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
              <span className="text-gray-600 text-sm">
                {property?.name || "No hay propiedad seleccionada"}
              </span>
            </div>
            {property && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Propiedad seleccionada:</strong> {property.name}
                {property.address && (
                  <span className="block text-xs text-gray-500">
                    {property.address}
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