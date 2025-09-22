"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContactInfo } from "@/types/guide"

interface ContactEditFormProps {
  contactInfo: ContactInfo
  guideId: string
}

export function ContactEditForm({ contactInfo, guideId }: ContactEditFormProps) {
  const [formData, setFormData] = useState({
    host_names: contactInfo.host_names,
    phone: contactInfo.phone,
    email: contactInfo.email,
    whatsapp: contactInfo.whatsapp,
    emergency_numbers: contactInfo.emergency_numbers,
    service_issues: contactInfo.service_issues.join("\n"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedContactInfo = {
      ...contactInfo,
      ...formData,
      service_issues: formData.service_issues.split("\n").filter((issue) => issue.trim() !== ""),
    }
    console.log("Saving contact info:", updatedContactInfo)
    alert("Información de contacto guardada (simulado)")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-phone-alt text-blue-600"></i>
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host-names">Nombres de los Anfitriones</Label>
                <Input
                  id="host-names"
                  value={formData.host_names}
                  onChange={(e) => setFormData({ ...formData, host_names: e.target.value })}
                  placeholder="Ej: Sonia y Pedro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Números de Emergencia</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencias">Emergencias</Label>
                  <Input
                    id="emergencias"
                    value={formData.emergency_numbers.emergencias}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_numbers: { ...formData.emergency_numbers, emergencias: e.target.value },
                      })
                    }
                    placeholder="112"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policia">Policía Local</Label>
                  <Input
                    id="policia"
                    value={formData.emergency_numbers.policia_local}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_numbers: { ...formData.emergency_numbers, policia_local: e.target.value },
                      })
                    }
                    placeholder="092"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardia">Guardia Civil</Label>
                  <Input
                    id="guardia"
                    value={formData.emergency_numbers.guardia_civil}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_numbers: { ...formData.emergency_numbers, guardia_civil: e.target.value },
                      })
                    }
                    placeholder="062"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bomberos">Bomberos</Label>
                  <Input
                    id="bomberos"
                    value={formData.emergency_numbers.bomberos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_numbers: { ...formData.emergency_numbers, bomberos: e.target.value },
                      })
                    }
                    placeholder="080"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-issues">Problemas de Servicio (uno por línea)</Label>
              <Textarea
                id="service-issues"
                value={formData.service_issues}
                onChange={(e) => setFormData({ ...formData, service_issues: e.target.value })}
                placeholder="Problemas con el aire acondicionado o calefacción&#10;Incidencias con el WiFi&#10;Falta de algún utensilio en la cocina"
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
