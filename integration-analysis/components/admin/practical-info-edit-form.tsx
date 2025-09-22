"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PracticalInfo } from "@/types/guide"

interface PracticalInfoEditFormProps {
  practicalInfo: PracticalInfo
  guideId: string
}

export function PracticalInfoEditForm({ practicalInfo, guideId }: PracticalInfoEditFormProps) {
  const [formData, setFormData] = useState({
    transport_info: practicalInfo.transport_info,
    parking_info: practicalInfo.parking_info,
    shopping_info: practicalInfo.shopping_info,
    medical_info: practicalInfo.medical_info,
    wifi_info: practicalInfo.wifi_info,
    additional_tips: practicalInfo.additional_tips.join("\n"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedPracticalInfo = {
      ...practicalInfo,
      ...formData,
      additional_tips: formData.additional_tips.split("\n").filter((tip) => tip.trim() !== ""),
    }
    console.log("Saving practical info:", updatedPracticalInfo)
    alert("Información práctica guardada (simulado)")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-600"></i>
            Información Práctica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="transport">Transporte</Label>
                <Textarea
                  id="transport"
                  value={formData.transport_info}
                  onChange={(e) => setFormData({ ...formData, transport_info: e.target.value })}
                  placeholder="Información sobre transporte público, taxis, etc."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking">Aparcamiento</Label>
                <Textarea
                  id="parking"
                  value={formData.parking_info}
                  onChange={(e) => setFormData({ ...formData, parking_info: e.target.value })}
                  placeholder="Información sobre aparcamiento disponible"
                  rows={4}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shopping">Compras</Label>
                <Textarea
                  id="shopping"
                  value={formData.shopping_info}
                  onChange={(e) => setFormData({ ...formData, shopping_info: e.target.value })}
                  placeholder="Supermercados, tiendas, mercados cercanos"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical">Servicios Médicos</Label>
                <Textarea
                  id="medical"
                  value={formData.medical_info}
                  onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
                  placeholder="Centros de salud, farmacias, hospitales"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wifi">Información WiFi</Label>
              <Textarea
                id="wifi"
                value={formData.wifi_info}
                onChange={(e) => setFormData({ ...formData, wifi_info: e.target.value })}
                placeholder="Nombre de red, contraseña, instrucciones de conexión"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tips">Consejos Adicionales (uno por línea)</Label>
              <Textarea
                id="tips"
                value={formData.additional_tips}
                onChange={(e) => setFormData({ ...formData, additional_tips: e.target.value })}
                placeholder="Consejos útiles para los huéspedes&#10;Recomendaciones especiales&#10;Información importante"
                rows={6}
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
    </div>
  )
}
