"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CompleteIconSelector } from "@/components/ui/CompleteIconSelector"
import { ImageSelector } from "@/components/ui/ImageSelector"
import { ApartmentSection } from "@/types/guides"
import { getApartmentSections, createApartmentSection, updateApartmentSection, deleteApartmentSection } from "@/lib/guides"

interface ApartmentSectionsManagerProps {
  guideId: string
  apartmentSections?: ApartmentSection[]
  onDataChange?: () => void
}

const SECTION_TYPES = [
  { value: "cocina", label: "Cocina", icon: "fas fa-utensils" },
  { value: "bano", label: "Baño", icon: "fas fa-shower" },
  { value: "salon", label: "Salón", icon: "fas fa-couch" },
  { value: "dormitorio", label: "Dormitorio", icon: "fas fa-bed" },
  { value: "terraza", label: "Terraza", icon: "fas fa-sun" },
  { value: "entrada", label: "Entrada", icon: "fas fa-door-open" },
  { value: "balcon", label: "Balcón", icon: "fas fa-wind" },
  { value: "garaje", label: "Garaje", icon: "fas fa-car" },
]

export function ApartmentSectionsManager({ guideId, apartmentSections = [], onDataChange }: ApartmentSectionsManagerProps) {
  const [sections, setSections] = useState<ApartmentSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ApartmentSection | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Usar las secciones pasadas como prop
  useEffect(() => {
    if (apartmentSections.length > 0) {
      setSections(apartmentSections)
      setLoading(false)
    } else {
      // Si no hay secciones pasadas, cargar desde la API
      loadSections()
    }
  }, [apartmentSections, guideId])

  const loadSections = async () => {
    try {
      setLoading(true)
      const sectionsData = await getApartmentSections(guideId)
      setSections(sectionsData || [])
    } catch (error) {
      console.error('Error loading apartment sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (section: ApartmentSection) => {
    setEditingSection(section)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingSection({
      id: "",
      tenant_id: 0,
      guide_id: guideId,
      section_type: "cocina",
      title: "",
      description: "",
      details: "",
      image_url: "",
      icon: "fas fa-home",
      order_index: sections.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingSection) return

    try {
      if (isAddingNew) {
        // Crear nueva sección
        const newSection = await createApartmentSection({
          guide_id: guideId,
          section_type: editingSection.section_type,
          title: editingSection.title,
          description: editingSection.description,
          details: editingSection.details,
          image_url: editingSection.image_url,
          icon: editingSection.icon,
          order_index: editingSection.order_index
        })
        
        if (newSection) {
          setSections([...sections, newSection])
          // Notificar que los datos han cambiado para refrescar la página pública
          onDataChange?.()
        }
      } else {
        // Actualizar sección existente
        const updatedSection = await updateApartmentSection(editingSection.id, {
          section_type: editingSection.section_type,
          title: editingSection.title,
          description: editingSection.description,
          details: editingSection.details,
          image_url: editingSection.image_url,
          icon: editingSection.icon,
          order_index: editingSection.order_index
        })
        
        if (updatedSection) {
          setSections(sections.map(section => section.id === editingSection.id ? updatedSection : section))
          // Notificar que los datos han cambiado para refrescar la página pública
          onDataChange?.()
        }
      }
      
      setEditingSection(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving apartment section:', error)
    }
  }

  const handleDelete = async (sectionId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sección?")) {
      try {
        const success = await deleteApartmentSection(sectionId)
        if (success) {
          setSections(sections.filter(section => section.id !== sectionId))
          // Notificar que los datos han cambiado para refrescar la página pública
          onDataChange?.()
        }
      } catch (error) {
        console.error('Error deleting apartment section:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingSection(null)
    setIsAddingNew(false)
  }


  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Cargando secciones del apartamento...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-home text-blue-600"></i>
              Secciones del Apartamento ({sections.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Sección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-home text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay secciones del apartamento creadas</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Crea secciones para mostrar las diferentes áreas del apartamento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => {
                // Usar el icono de la base de datos si existe, sino usar el por defecto
                const finalIcon = section.icon || SECTION_TYPES.find(st => st.value === section.section_type)?.icon || "fas fa-home"
                
                return (
                  <Card key={section.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {section.image_url && (
                      <div className="aspect-video bg-gray-200">
                        <img 
                          src={section.image_url} 
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <i className={`${finalIcon} text-blue-600`}></i>
                          <span className="text-sm font-medium text-blue-600">
                            {SECTION_TYPES.find(st => st.value === section.section_type)?.label || section.section_type}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(section)}>
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(section.id)}>
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{section.description}</p>
                      {section.details && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-700">{section.details}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
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
                  <Label htmlFor="section-type">Tipo de Sección</Label>
                  <select
                    id="section-type"
                    value={editingSection.section_type}
                    onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-title">Título</Label>
                  <Input
                    id="section-title"
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                    placeholder="Título de la sección"
                  />
                </div>
              </div>

              <ImageSelector
                value={editingSection.image_url}
                onChange={(url) => setEditingSection({ ...editingSection, image_url: url })}
                onError={(error) => console.error('Image error:', error)}
                label=""
                className="col-span-2"
              />

              <div className="space-y-2">
                <Label htmlFor="section-description">Descripción</Label>
                <Textarea
                  id="section-description"
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  placeholder="Descripción de la sección"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-details">Detalles Adicionales</Label>
                <Textarea
                  id="section-details"
                  value={editingSection.details}
                  onChange={(e) => setEditingSection({ ...editingSection, details: e.target.value })}
                  placeholder="Detalles adicionales, consejos, etc."
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <CompleteIconSelector
                  value={editingSection.icon}
                  onChange={(icon) => setEditingSection({ ...editingSection, icon })}
                  label="Icono"
                />
                <div className="space-y-2">
                  <Label htmlFor="section-order">Orden</Label>
                  <Input
                    id="section-order"
                    type="number"
                    value={editingSection.order_index || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
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
