"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Guide, GuideSection } from "@/types/guide"

interface GuideEditFormProps {
  guide: Guide
  sections: GuideSection[]
}

export function GuideEditForm({ guide, sections }: GuideEditFormProps) {
  const [formData, setFormData] = useState({
    title: guide.title,
    welcome_message: guide.welcome_message,
    host_names: guide.host_names,
    host_signature: guide.host_signature,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving guide:", formData)
    alert("Guía guardada (simulado)")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-book text-blue-600"></i>
            Información General de la Guía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Guía</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Guía del Huésped"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host_names">Nombres de los Anfitriones</Label>
              <Input
                id="host_names"
                value={formData.host_names}
                onChange={(e) => setFormData({ ...formData, host_names: e.target.value })}
                placeholder="Ej: Sonia y Pedro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
              <Textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                placeholder="Mensaje de bienvenida para los huéspedes"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host_signature">Firma de los Anfitriones</Label>
              <Input
                id="host_signature"
                value={formData.host_signature}
                onChange={(e) => setFormData({ ...formData, host_signature: e.target.value })}
                placeholder="Ej: Con cariño, Sonia y Pedro"
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-list text-blue-600"></i>
            Secciones de la Guía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{section.title}</h4>
                  <Button size="sm" variant="outline">
                    <i className="fas fa-edit mr-2"></i>
                    Editar
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{section.content}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              <i className="fas fa-plus mr-2"></i>
              Agregar Nueva Sección
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
