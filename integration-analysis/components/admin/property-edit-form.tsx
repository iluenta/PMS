"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Property } from "@/types/guide"

interface PropertyEditFormProps {
  property: Property
}

export function PropertyEditForm({ property }: PropertyEditFormProps) {
  const [formData, setFormData] = useState({
    name: property.name,
    address: property.address,
    description: property.description,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally save to Supabase
    console.log("Saving property:", formData)
    alert("Propiedad guardada (simulado)")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-home text-blue-600"></i>
          Información de la Propiedad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Propiedad</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: VeraTespera"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ej: Calle Ejemplo, 123, 04620 Vera, Almería"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción breve de la propiedad"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              <i className="fas fa-save mr-2"></i>
              Guardar Cambios
            </Button>
            <Button type="button" variant="outline">
              <i className="fas fa-undo mr-2"></i>
              Descartar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
