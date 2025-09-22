"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock properties data
const mockProperties = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "VeraTespera",
    address: "Calle Ejemplo, 123, 04620 Vera, Almería",
    description: "Hermoso apartamento en Vera, perfecto para vacaciones en familia",
    created_at: "2024-01-15",
    has_guide: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Casa del Mar",
    address: "Avenida Playa, 45, 04620 Vera, Almería",
    description: "Villa frente al mar con vistas espectaculares",
    created_at: "2024-02-20",
    has_guide: false,
  },
]

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProperties = mockProperties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Nueva Propiedad
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <Input
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <Badge variant={property.has_guide ? "default" : "secondary"}>
                    {property.has_guide ? "Con Guía" : "Sin Guía"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                <p className="text-sm text-gray-700 mb-4">{property.description}</p>
                <p className="text-xs text-gray-500 mb-4">Creado: {property.created_at}</p>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/${property.id}/guide`}>
                      <i className="fas fa-eye mr-2"></i>
                      Ver Guía
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/admin/properties/${property.id}/edit`}>
                      <i className="fas fa-edit mr-2"></i>
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No se encontraron propiedades</p>
          </div>
        )}
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  )
}
