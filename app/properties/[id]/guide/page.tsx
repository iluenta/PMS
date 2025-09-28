"use client"

import { useState, useEffect, useRef } from "react"
import { useGuideData } from "@/hooks/useGuideData"
import { BeachesEditForm } from "@/components/admin/BeachesEditForm"
import { RestaurantsEditForm } from "@/components/admin/RestaurantsEditForm"
import { ActivitiesEditForm } from "@/components/admin/ActivitiesEditForm"
import { Layout } from "@/components/Layout"
import { createGuideSection, updateGuideSection, deleteGuideSection, createGuide, updateGuide } from "@/lib/guides"
import { IconSelector } from "@/components/ui/IconSelector"
import { SectionManager } from "@/components/admin/SectionManager"
import { HouseRulesManager } from "@/components/admin/HouseRulesManager"
import { HouseGuideManager } from "@/components/admin/HouseGuideManager"
import { TipsManager } from "@/components/admin/TipsManager"
import { ApartmentSectionsManager } from "@/components/admin/ApartmentSectionsManager"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import type { Guide, GuideSection } from "@/types/guides"

interface GuideEditPageProps {
  params: Promise<{ id: string }>
}

export default function GuideEditPage({ params }: GuideEditPageProps) {
  return (
    <Layout>
      <GuideEditContent params={params} />
    </Layout>
  )
}

function GuideEditContent({ params }: GuideEditPageProps) {
  const [propertyId, setPropertyId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState({
    title: "",
    welcome_message: "",
    host_names: "",
    host_signature: "",
  })
  const [sections, setSections] = useState<GuideSection[]>([])
  const [beaches, setBeaches] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingSection, setEditingSection] = useState<GuideSection | null>(null)
  const [newSection, setNewSection] = useState<{
    section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
    title: string
    content: string
    icon: string
  }>({
    section_type: "apartment",
    title: "",
    content: "",
    icon: "fas fa-home"
  })
  const isInitialLoad = useRef(true)

  // Resolver params usando useEffect
  useEffect(() => {
    params.then(({ id }) => setPropertyId(id))
  }, [params])

  const { data, loading, error, refetch } = useGuideData(propertyId)

  // Actualizar formData cuando se cargan los datos
  useEffect(() => {
    if (data?.guide) {
      setFormData({
        title: data.guide.title || "",
        welcome_message: data.guide.welcome_message || "",
        host_names: data.guide.host_names || "",
        host_signature: data.guide.host_signature || "",
      })
    }
    if (data?.sections) {
      console.log('Updating sections from data.sections:', data.sections)
      console.log('🔍 DEBUG: data.sections icons:', data.sections.map(s => ({ title: s.title, icon: s.icon, section_type: s.section_type })))
      setSections(data.sections)
      if (isInitialLoad.current) {
        isInitialLoad.current = false
      }
    }
    // DEBUG: Verificar qué se está mostrando en la página admin
    console.log('🔍 DEBUG: ¿Qué se está mostrando en la página admin?')
    console.log('  - data.sections:', data?.sections?.length || 0, 'elementos')
    console.log('  - data.apartment_sections:', data?.apartment_sections?.length || 0, 'elementos')
    console.log('  - sections state:', sections.length, 'elementos')
    if (data?.beaches) {
      setBeaches(data.beaches)
    }
    if (data?.restaurants) {
      setRestaurants(data.restaurants)
    }
    if (data?.activities) {
      setActivities(data.activities)
    }
  }, [data])

  // Debug: Log cuando cambie el estado de sections
  useEffect(() => {
    console.log('Sections state changed:', sections)
  }, [sections])

  // Funciones para verificar si existe una sección de cada tipo
  const hasSectionType = (type: string) => {
    return sections.some(section => section.section_type === type)
  }

  const getSectionByType = (type: string): GuideSection | null => {
    return sections.find(section => section.section_type === type) || null
  }

  const handleSectionChange = async (updatedSection: GuideSection) => {
    if (!data?.guide?.id) return
    
    try {
      if (updatedSection.id) {
        // Actualizar sección existente
        const result = await updateGuideSection(updatedSection.id, {
          title: updatedSection.title,
          content: updatedSection.content,
          icon: updatedSection.icon
        })
        
        if (result) {
          setSections(prevSections => 
            prevSections.map(section => 
              section.id === updatedSection.id ? { ...section, ...updatedSection } : section
            )
          )
        }
      } else {
        // Crear nueva sección
        const result = await createGuideSection({
          guide_id: data.guide.id,
          section_type: updatedSection.section_type,
          title: updatedSection.title,
          content: updatedSection.content,
          icon: updatedSection.icon,
          order_index: sections.length + 1
        })
        
        if (result) {
          setSections(prevSections => [...prevSections, result])
        }
      }
    } catch (error) {
      console.error('Error saving section:', error)
    }
  }

  const handleAddSection = async () => {
    if (!data?.guide?.id) return
    
    // Si estamos editando, usar la función de actualización
    if (editingSection) {
      await handleUpdateSection()
      return
    }
    
    try {
      console.log('Creating new section:', newSection)
      console.log('Current sections before creation:', sections)
      
      const sectionData = {
        guide_id: data.guide.id,
        section_type: newSection.section_type,
        title: newSection.title,
        content: newSection.content,
        order_index: sections.length,
        is_active: true,
      }
      
      const createdSection = await createGuideSection(sectionData)
      
      if (createdSection) {
        console.log('Section created successfully:', createdSection)
        
        // Usar función de actualización para asegurar que tenemos el estado más reciente
        setSections(prevSections => {
          const newSections = [...prevSections, createdSection]
          console.log('Previous sections:', prevSections)
          console.log('New sections after adding:', newSections)
          return newSections
        })
        
        setNewSection({
          section_type: "apartment",
          title: "",
          content: "",
          icon: "",
        })
        setShowAddSection(false)
        
        console.log('State update triggered')
      }
    } catch (error) {
      console.error('Error creating section:', error)
    }
  }

  const handleEditSection = (section: GuideSection) => {
    setEditingSection(section)
    setNewSection({
      section_type: section.section_type,
      title: section.title || "",
      content: section.content || "",
      icon: section.icon || "fas fa-home"
    })
    setShowAddSection(true)
  }

  const handleUpdateSection = async () => {
    if (!editingSection) return
    
    try {
      console.log('Updating section:', editingSection.id, newSection)
      
      const updatedSection = await updateGuideSection(editingSection.id, {
        section_type: newSection.section_type,
        title: newSection.title,
        content: newSection.content,
      })
      
      if (updatedSection) {
        console.log('Section updated successfully:', updatedSection)
        
        setSections(prevSections => 
          prevSections.map(section => 
            section.id === editingSection.id ? updatedSection : section
          )
        )
        
        setEditingSection(null)
        setNewSection({
          section_type: "apartment",
          title: "",
          content: "",
          icon: "",
        })
        setShowAddSection(false)
        
        console.log('Section updated in state')
      }
    } catch (error) {
      console.error('Error updating section:', error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sección?')) return
    
    try {
      console.log('Deleting section:', sectionId)
      
      await deleteGuideSection(sectionId)
      
      setSections(prevSections => 
        prevSections.filter(section => section.id !== sectionId)
      )
      
      console.log('Section deleted from state')
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log("Saving guide:", formData)
      
      if (data?.guide?.id) {
        // Actualizar guía existente
        const updatedGuide = await updateGuide(data.guide.id, {
          title: formData.title,
          welcome_message: formData.welcome_message,
          host_names: formData.host_names,
          host_signature: formData.host_signature,
        })
        
        if (updatedGuide) {
          console.log("Guide updated successfully:", updatedGuide)
          alert("Guía actualizada correctamente")
          // Refrescar los datos
          refetch()
        } else {
          throw new Error("No se pudo actualizar la guía")
        }
      } else {
        // Crear nueva guía
        const newGuide = await createGuide({
          property_id: propertyId,
          title: formData.title,
          welcome_message: formData.welcome_message,
          host_names: formData.host_names,
          host_signature: formData.host_signature,
        })
        
        if (newGuide) {
          console.log("Guide created successfully:", newGuide)
          alert("Guía creada correctamente")
          // Refrescar los datos
          refetch()
        } else {
          throw new Error("No se pudo crear la guía")
        }
      }
    } catch (error) {
      console.error("Error saving guide:", error)
      alert("Error al guardar la guía: " + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error al cargar los datos</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <div className="mt-4 space-x-2">
            <Button asChild>
              <Link href="/properties">Volver a Propiedades</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides">Ir a Guías</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-book text-4xl text-blue-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay guía para esta propiedad</h2>
          <p className="text-gray-600 mb-4">Puedes crear una guía del huésped para esta propiedad</p>
          <div className="mt-4 space-x-2">
            <Button asChild>
              <Link href="/guides">Crear Guía</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/properties">Volver a Propiedades</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/properties">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Volver
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Guía: {data.property.name}</h1>
                <p className="text-sm text-gray-600">{data.property.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/properties/${propertyId}/guide/public`}>
                  <i className="fas fa-eye mr-2"></i>
                  Ver Guía
                </Link>
              </Button>
              <Badge variant="default">Editando</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="overview" className="text-xs">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-xs">
              Guía
            </TabsTrigger>
            <TabsTrigger 
              value="apartment" 
              className="text-xs"
              disabled={!hasSectionType('apartment')}
            >
              Apartamento
            </TabsTrigger>
            <TabsTrigger 
              value="rules" 
              className="text-xs"
              disabled={!hasSectionType('rules')}
            >
              Normas
            </TabsTrigger>
            <TabsTrigger 
              value="house_guide" 
              className="text-xs"
              disabled={!hasSectionType('house_guide')}
            >
              Guía Casa
            </TabsTrigger>
            <TabsTrigger 
              value="tips" 
              className="text-xs"
              disabled={!hasSectionType('tips')}
            >
              Consejos
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="text-xs"
              disabled={!hasSectionType('contact')}
            >
              Contacto
            </TabsTrigger>
            <TabsTrigger value="beaches" className="text-xs">
              Playas
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="text-xs">
              Restaurantes
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs">
              Actividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-chart-bar text-blue-600"></i>
                    Resumen de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <i className="fas fa-list text-2xl text-blue-600 mb-2"></i>
                      <p className="font-semibold">{sections.length}</p>
                      <p className="text-sm text-gray-600">Secciones</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <i className="fas fa-umbrella-beach text-2xl text-green-600 mb-2"></i>
                      <p className="font-semibold">{data.beaches.length}</p>
                      <p className="text-sm text-gray-600">Playas</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <i className="fas fa-utensils text-2xl text-orange-600 mb-2"></i>
                      <p className="font-semibold">{data.restaurants.length}</p>
                      <p className="text-sm text-gray-600">Restaurantes</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <i className="fas fa-hiking text-2xl text-purple-600 mb-2"></i>
                      <p className="font-semibold">{data.activities.length}</p>
                      <p className="text-sm text-gray-600">Actividades</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    Información de la Propiedad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Nombre:</strong> {data.property.name}</p>
                    <p><strong>Dirección:</strong> {data.property.address}</p>
                    <p><strong>Descripción:</strong> {data.property.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guide">
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
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className={`${section.icon || 'fas fa-info-circle'} text-blue-600`}></i>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{section.title}</h4>
                              <p className="text-xs text-gray-500 capitalize">{section.section_type}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditSection(section)}
                            >
                              <i className="fas fa-edit mr-2"></i>
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{section.content}</p>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent"
                      onClick={() => setShowAddSection(true)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Agregar Nueva Sección
                    </Button>
                    
                    {showAddSection && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-semibold mb-3">
                          {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="section_type">Tipo de Sección</Label>
                            <select
                              id="section_type"
                              value={newSection.section_type}
                              onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value as any })}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="apartment">Apartamento</option>
                              <option value="rules">Normas</option>
                              <option value="house_guide">Guía de la Casa</option>
                              <option value="tips">Consejos</option>
                              <option value="contact">Contacto</option>
                            </select>
                          </div>

                          <IconSelector
                            value={newSection.icon}
                            onChange={(icon) => setNewSection({ ...newSection, icon })}
                            category="general"
                            label="Icono de la Sección"
                          />
                          
                          <div>
                            <Label htmlFor="section_title">Título</Label>
                            <Input
                              id="section_title"
                              value={newSection.title}
                              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                              placeholder="Título de la sección"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="section_content">Contenido</Label>
                            <Textarea
                              id="section_content"
                              value={newSection.content}
                              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                              placeholder="Contenido de la sección"
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={handleAddSection} size="sm">
                              <i className="fas fa-save mr-2"></i>
                              {editingSection ? 'Actualizar Sección' : 'Guardar Sección'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setShowAddSection(false)
                                setEditingSection(null)
                                setNewSection({ section_type: "apartment", title: "", content: "", icon: "fas fa-home" })
                              }}
                            >
                              <i className="fas fa-times mr-2"></i>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="apartment">
            <SectionManager
              section={getSectionByType('apartment')}
              guideId={data?.guide?.id || ''}
              sectionType="apartment"
              defaultTitle="Descripción del Apartamento"
              defaultIcon="fas fa-home"
              iconCategory="house"
              placeholder="Describe el apartamento, sus características, distribución, comodidades..."
              onSectionChange={handleSectionChange}
            />
          </TabsContent>

          <TabsContent value="apartment">
            <div className="space-y-6">
              {data?.guide?.id && (
                <ApartmentSectionsManager 
                  guideId={data.guide.id} 
                  apartmentSections={data.apartment_sections || []}
                  onDataChange={refetch} 
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <div className="space-y-6">
              {data?.guide?.id && (
                <HouseRulesManager guideId={data.guide.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="house_guide">
            <div className="space-y-6">
              {data?.guide?.id && (
                <HouseGuideManager guideId={data.guide.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <div className="space-y-6">
              {data?.guide?.id && (
                <TipsManager guideId={data.guide.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <SectionManager
              section={getSectionByType('contact')}
              guideId={data?.guide?.id || ''}
              sectionType="contact"
              defaultTitle="Información de Contacto"
              defaultIcon="fas fa-phone-alt"
              iconCategory="general"
              placeholder="Proporciona información de contacto, números de emergencia, horarios de atención..."
              onSectionChange={handleSectionChange}
            />
          </TabsContent>

          <TabsContent value="beaches">
            {data?.guide?.id ? (
              <BeachesEditForm 
                beaches={beaches} 
                guideId={data.guide.id} 
                onBeachesChange={setBeaches}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar playas sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="restaurants">
            {data?.guide?.id ? (
              <RestaurantsEditForm 
                restaurants={restaurants} 
                guideId={data.guide.id} 
                onRestaurantsChange={setRestaurants}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar restaurantes sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activities">
            {data?.guide?.id ? (
              <ActivitiesEditForm 
                activities={activities} 
                guideId={data.guide.id} 
                onActivitiesChange={setActivities}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar actividades sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
