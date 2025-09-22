"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconSelector } from "@/components/ui/IconSelector"
import { GuideSection } from "@/types/guides"

interface SectionManagerProps {
  section: GuideSection | null
  guideId: string
  sectionType: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  defaultTitle: string
  defaultIcon: string
  iconCategory: "general" | "house" | "rules" | "beaches" | "restaurants" | "activities"
  placeholder: string
  onSectionChange: (section: GuideSection) => void
}

export function SectionManager({ 
  section, 
  guideId, 
  sectionType, 
  defaultTitle, 
  defaultIcon, 
  iconCategory,
  placeholder,
  onSectionChange 
}: SectionManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingData, setEditingData] = useState({
    title: section?.title || defaultTitle,
    content: section?.content || "",
    icon: section?.icon || defaultIcon
  })

  const handleSave = () => {
    if (section) {
      // Actualizar sección existente
      onSectionChange({
        ...section,
        title: editingData.title,
        content: editingData.content,
        icon: editingData.icon
      })
    } else {
      // Crear nueva sección
      const newSection: GuideSection = {
        id: "",
        tenant_id: 0,
        guide_id: guideId,
        section_type: sectionType,
        title: editingData.title,
        content: editingData.content,
        icon: editingData.icon,
        order_index: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      onSectionChange(newSection)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditingData({
      title: section?.title || defaultTitle,
      content: section?.content || "",
      icon: section?.icon || defaultIcon
    })
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditingData({
      title: section?.title || defaultTitle,
      content: section?.content || "",
      icon: section?.icon || defaultIcon
    })
    setIsEditing(true)
  }

  if (!section && !isEditing) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <i className={`${defaultIcon} text-4xl text-gray-400 mb-4`}></i>
          <p className="text-gray-600">No hay {defaultTitle.toLowerCase()} creado</p>
          <p className="text-sm text-gray-500 mt-2 mb-4">Crea esta sección para proporcionar información útil a los huéspedes</p>
          <Button onClick={() => setIsEditing(true)}>
            <i className="fas fa-plus mr-2"></i>
            Crear {defaultTitle}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className={`${defaultIcon} text-blue-600`}></i>
            {section ? `Editar ${defaultTitle}` : `Crear ${defaultTitle}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Título</Label>
              <Input
                id="section-title"
                value={editingData.title}
                onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                placeholder={`Título de ${defaultTitle.toLowerCase()}`}
              />
            </div>

            <IconSelector
              value={editingData.icon}
              onChange={(icon) => setEditingData({ ...editingData, icon })}
              category={iconCategory}
              label="Icono"
            />

            <div className="space-y-2">
              <Label htmlFor="section-content">Contenido</Label>
              <Textarea
                id="section-content"
                value={editingData.content}
                onChange={(e) => setEditingData({ ...editingData, content: e.target.value })}
                placeholder={placeholder}
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <i className="fas fa-save mr-2"></i>
                {section ? "Actualizar" : "Crear"} {defaultTitle}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <i className="fas fa-times mr-2"></i>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <i className={`${section?.icon || defaultIcon} text-blue-600`}></i>
            {section?.title || defaultTitle}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <i className="fas fa-edit mr-2"></i>
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{section?.content}</p>
        </div>
      </CardContent>
    </Card>
  )
}










