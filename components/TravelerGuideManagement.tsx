"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  supabase,
  isDemoMode,
  mockData,
  type Property,
  type TravelerGuideSection,
  type TravelerGuideItem,
} from "@/lib/supabase"
import { BookOpen, Plus, Edit, Trash2, MapPin, Phone, Globe, ChevronUp, ChevronDown } from "lucide-react"

export default function TravelerGuideManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [sections, setSections] = useState<TravelerGuideSection[]>([])
  const [loading, setLoading] = useState(true)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<TravelerGuideSection | null>(null)
  const [editingItem, setEditingItem] = useState<TravelerGuideItem | null>(null)
  const [editingSectionId, setEditingSectionId] = useState<string>("")

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      fetchGuideSections()
    }
  }, [selectedProperty])

  const fetchProperties = async () => {
    try {
      if (isDemoMode) {
        setProperties(mockData.properties)
        if (mockData.properties.length > 0) {
          setSelectedProperty(mockData.properties[0].id)
        }
        return
      }

      const { data, error } = await supabase.from("properties").select("*").eq("status", "active")
      if (error) throw error

      setProperties(data || [])
      if (data && data.length > 0) {
        setSelectedProperty(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGuideSections = async () => {
    try {
      if (isDemoMode) {
        const sectionsWithItems = mockData.travelerGuideSections
          .filter((section) => section.property_id === selectedProperty)
          .map((section) => ({
            ...section,
            items: mockData.travelerGuideItems.filter((item) => item.section_id === section.id),
          }))
          .sort((a, b) => a.order_index - b.order_index)

        setSections(sectionsWithItems)
        return
      }

      const { data, error } = await supabase
        .from("traveler_guide_sections")
        .select(`
          *,
          items:traveler_guide_items(*)
        `)
        .eq("property_id", selectedProperty)
        .order("order_index", { ascending: true })

      if (error) throw error
      setSections(data || [])
    } catch (error) {
      console.error("Error fetching guide sections:", error)
    }
  }

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case "checkin":
        return "Check-in"
      case "apartment_info":
        return "Info del Apartamento"
      case "places_to_visit":
        return "Lugares que Visitar"
      case "restaurants":
        return "Restaurantes"
      case "emergency_contacts":
        return "Contactos de Emergencia"
      case "house_rules":
        return "Normas de la Casa"
      default:
        return type
    }
  }

  const handleEditSection = (section: TravelerGuideSection) => {
    setEditingSection(section)
    setIsSectionDialogOpen(true)
  }

  const handleAddSection = () => {
    setEditingSection(null)
    setIsSectionDialogOpen(true)
  }

  const handleEditItem = (item: TravelerGuideItem, sectionId: string) => {
    setEditingItem(item)
    setEditingSectionId(sectionId)
    setIsItemDialogOpen(true)
  }

  const handleAddItem = (sectionId: string) => {
    setEditingItem(null)
    setEditingSectionId(sectionId)
    setIsItemDialogOpen(true)
  }

  const toggleSectionActive = async (section: TravelerGuideSection) => {
    try {
      if (isDemoMode) {
        alert(`Sección ${section.is_active ? "desactivada" : "activada"} (Demo)`)
        return
      }

      const { error } = await supabase
        .from("traveler_guide_sections")
        .update({ is_active: !section.is_active })
        .eq("id", section.id)

      if (error) throw error
      fetchGuideSections()
    } catch (error) {
      console.error("Error updating section:", error)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta sección?")) return

    try {
      if (isDemoMode) {
        alert("Sección eliminada (Demo)")
        return
      }

      const { error } = await supabase.from("traveler_guide_sections").delete().eq("id", sectionId)
      if (error) throw error
      fetchGuideSections()
    } catch (error) {
      console.error("Error deleting section:", error)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este elemento?")) return

    try {
      if (isDemoMode) {
        alert("Elemento eliminado (Demo)")
        return
      }

      const { error } = await supabase.from("traveler_guide_items").delete().eq("id", itemId)
      if (error) throw error
      fetchGuideSections()
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const moveSection = async (sectionId: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    try {
      if (isDemoMode) {
        alert("Orden actualizado (Demo)")
        return
      }

      const currentSection = sections[currentIndex]
      const targetSection = sections[targetIndex]

      await supabase
        .from("traveler_guide_sections")
        .update({ order_index: targetSection.order_index })
        .eq("id", currentSection.id)

      await supabase
        .from("traveler_guide_sections")
        .update({ order_index: currentSection.order_index })
        .eq("id", targetSection.id)

      fetchGuideSections()
    } catch (error) {
      console.error("Error moving section:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Guía del Viajero</h1>
          <p className="mt-2 text-gray-600">Configura la información para tus huéspedes</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="property-select">Seleccionar Propiedad</Label>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger>
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
        </div>
        <div className="pt-6">
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sección
          </Button>
        </div>
      </div>

      {selectedProperty && (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={section.id} className={`${!section.is_active ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{getSectionTypeLabel(section.section_type)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(section.id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(section.id, "down")}
                        disabled={index === sections.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Switch checked={section.is_active} onCheckedChange={() => toggleSectionActive(section)} />
                    <Button variant="outline" size="sm" onClick={() => handleEditSection(section)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteSection(section.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {section.content && <p className="text-sm text-gray-600 mb-4">{section.content}</p>}

                {section.items && section.items.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm">Elementos:</h4>
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            {item.address && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.address}
                              </div>
                            )}
                            {item.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {item.phone}
                              </div>
                            )}
                            {item.website && (
                              <div className="flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                {item.website}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item, section.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => handleAddItem(section.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Elemento
                </Button>
              </CardContent>
            </Card>
          ))}

          {sections.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay secciones</h3>
                <p className="text-gray-500 mb-4">Comienza creando la primera sección de la guía</p>
                <Button onClick={handleAddSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Sección
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <SectionDialog
            section={editingSection}
            propertyId={selectedProperty}
            onClose={() => setIsSectionDialogOpen(false)}
            onSave={fetchGuideSections}
          />
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <ItemDialog
            item={editingItem}
            sectionId={editingSectionId}
            onClose={() => setIsItemDialogOpen(false)}
            onSave={fetchGuideSections}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionDialog({
  section,
  propertyId,
  onClose,
  onSave,
}: {
  section: TravelerGuideSection | null
  propertyId: string
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    section_type: "checkin",
    title: "",
    content: "",
    is_active: true,
  })

  useEffect(() => {
    if (section) {
      setFormData({
        section_type: section.section_type,
        title: section.title,
        content: section.content || "",
        is_active: section.is_active,
      })
    } else {
      setFormData({
        section_type: "checkin",
        title: "",
        content: "",
        is_active: true,
      })
    }
  }, [section])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(section ? "Sección actualizada (Demo)" : "Sección creada (Demo)")
        onSave()
        onClose()
        return
      }

      if (section) {
        const { error } = await supabase.from("traveler_guide_sections").update(formData).eq("id", section.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("traveler_guide_sections").insert([
          {
            ...formData,
            property_id: propertyId,
            order_index: 999, // Will be adjusted by the database
          },
        ])
        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving section:", error)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{section ? "Editar Sección" : "Nueva Sección"}</DialogTitle>
        <DialogDescription>
          {section ? "Modifica los datos de la sección" : "Crea una nueva sección para la guía"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="section_type">Tipo de sección</Label>
          <Select
            value={formData.section_type}
            onValueChange={(value) => setFormData({ ...formData, section_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checkin">Check-in</SelectItem>
              <SelectItem value="apartment_info">Información del Apartamento</SelectItem>
              <SelectItem value="places_to_visit">Lugares que Visitar</SelectItem>
              <SelectItem value="restaurants">Restaurantes</SelectItem>
              <SelectItem value="emergency_contacts">Contactos de Emergencia</SelectItem>
              <SelectItem value="house_rules">Normas de la Casa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Contenido</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            placeholder="Contenido de la sección..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Sección activa</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{section ? "Actualizar" : "Crear"} Sección</Button>
        </div>
      </form>
    </>
  )
}

function ItemDialog({
  item,
  sectionId,
  onClose,
  onSave,
}: {
  item: TravelerGuideItem | null
  sectionId: string
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    image_url: "",
    is_active: true,
  })

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || "",
        address: item.address || "",
        phone: item.phone || "",
        website: item.website || "",
        image_url: item.image_url || "",
        is_active: item.is_active,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        address: "",
        phone: "",
        website: "",
        image_url: "",
        is_active: true,
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(item ? "Elemento actualizado (Demo)" : "Elemento creado (Demo)")
        onSave()
        onClose()
        return
      }

      if (item) {
        const { error } = await supabase.from("traveler_guide_items").update(formData).eq("id", item.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("traveler_guide_items").insert([
          {
            ...formData,
            section_id: sectionId,
            order_index: 999, // Will be adjusted by the database
          },
        ])
        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item ? "Editar Elemento" : "Nuevo Elemento"}</DialogTitle>
        <DialogDescription>
          {item ? "Modifica los datos del elemento" : "Añade un nuevo elemento a la sección"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Sitio web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">URL de imagen</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Elemento activo</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{item ? "Actualizar" : "Crear"} Elemento</Button>
        </div>
      </form>
    </>
  )
}
