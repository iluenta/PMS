"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { IconSelector } from "@/components/ui/icon-selector"
import type { GuideSection } from "@/types/guide"

interface SectionManagerProps {
  sections: GuideSection[]
  guideId: string
}

export function SectionManager({ sections, guideId }: SectionManagerProps) {
  const [editingSection, setEditingSection] = useState<GuideSection | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleEdit = (section: GuideSection) => {
    setEditingSection(section)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingSection({
      id: "",
      guide_id: guideId,
      title: "",
      content: "",
      section_type: "custom",
      icon: "fas fa-info-circle",
      order_index: sections.length + 1,
    })
    setIsAddingNew(true)
  }

  const handleSave = () => {
    console.log("Saving section:", editingSection)
    alert("Sección guardada (simulado)")
    setEditingSection(null)
    setIsAddingNew(false)
  }

  const handleDelete = (sectionId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sección?")) {
      console.log("Deleting section:", sectionId)
      alert("Sección eliminada (simulado)")
    }
  }

  const getSectionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: "Apartamento",
      rules: "Normas",
      house_guide: "Guía Casa",
      tips: "Consejos",
      beaches: "Playas",
      restaurants: "Restaurantes",
      activities: "Actividades",
      practical_info: "Info Práctica",
      contact: "Contacto",
      custom: "Personalizada",
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-list text-blue-600"></i>
              Secciones de la Guía ({sections.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Sección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${section.icon} text-blue-600`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{section.title}</h4>
                        <Badge variant="secondary">{getSectionTypeLabel(section.section_type)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{section.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(section)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(section.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingSection && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nueva Sección" : "Editar Sección"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Título</Label>
                  <Input
                    id="section-title"
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                    placeholder="Título de la sección"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-type">Tipo de Sección</Label>
                  <select
                    id="section-type"
                    value={editingSection.section_type}
                    onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="custom">Personalizada</option>
                    <option value="apartment">Apartamento</option>
                    <option value="rules">Normas</option>
                    <option value="house_guide">Guía Casa</option>
                    <option value="tips">Consejos</option>
                    <option value="beaches">Playas</option>
                    <option value="restaurants">Restaurantes</option>
                    <option value="activities">Actividades</option>
                    <option value="practical_info">Info Práctica</option>
                    <option value="contact">Contacto</option>
                  </select>
                </div>
              </div>

              <IconSelector
                value={editingSection.icon}
                onChange={(icon) => setEditingSection({ ...editingSection, icon })}
                category="general"
                label="Icono de la Sección"
              />

              <div className="space-y-2">
                <Label htmlFor="section-content">Contenido</Label>
                <Textarea
                  id="section-content"
                  value={editingSection.content}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  placeholder="Contenido de la sección"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-order">Orden</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={editingSection.order_index}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, order_index: Number.parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
