"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { createGuide } from "@/lib/guides"
import { Layout } from "@/components/Layout"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import type { Guide, Property } from "@/types/guides"

interface GuideWithProperty extends Guide {
  property: Property
}

function GuidesContent() {
  const { user } = useAuth()
  const [guides, setGuides] = useState<GuideWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    title: "Guía del Huésped",
    welcome_message: "",
    host_names: "",
    host_signature: "",
  })

  useEffect(() => {
    if (user?.tenant_id) {
      fetchGuides()
      fetchProperties()
    }
  }, [user?.tenant_id])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('guides')
        .select(`
          *,
          property:properties(id, name, address, description)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuides(data || [])
    } catch (err) {
      console.error('Error fetching guides:', err)
      setError(err instanceof Error ? err.message : 'Error fetching guides')
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      if (!user?.tenant_id) {
        console.log('No tenant_id available for user')
        setProperties([])
        return
      }

      console.log('Fetching properties for tenant:', user.tenant_id)
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, address, description')
        .eq('tenant_id', user.tenant_id)
        .order('name')

      if (error) throw error
      
      console.log('Properties found:', data?.length || 0)
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err instanceof Error ? err.message : 'Error fetching properties')
    }
  }

  const handleCreateGuide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPropertyId) {
      setError('Debes seleccionar una propiedad')
      return
    }

    try {
      console.log('Creating guide for property:', selectedPropertyId)
      console.log('Form data:', formData)
      
      const guideData = {
        property_id: selectedPropertyId,
        title: formData.title || "Guía del Huésped",
        welcome_message: formData.welcome_message || "",
        host_names: formData.host_names || "",
        host_signature: formData.host_signature || "",
      }
      
      console.log('Guide data to create:', guideData)
      
      const createdGuide = await createGuide(guideData)
      
      if (createdGuide) {
        console.log('Guide created successfully:', createdGuide)
        
        // Reset form and close dialog
        setFormData({
          title: "Guía del Huésped",
          welcome_message: "",
          host_names: "",
          host_signature: "",
        })
        setSelectedPropertyId("")
        setShowCreateDialog(false)
        setError(null)
        
        // Refresh guides list
        await fetchGuides()
      } else {
        setError('Error al crear la guía')
      }
    } catch (err) {
      console.error('Error creating guide:', err)
      setError(err instanceof Error ? err.message : 'Error creating guide')
    }
  }

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta guía?')) return

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', guideId)

      if (error) throw error
      await fetchGuides()
    } catch (err) {
      console.error('Error deleting guide:', err)
      setError(err instanceof Error ? err.message : 'Error deleting guide')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando guías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guías del Huésped</h1>
            <p className="text-gray-600 mt-2">Gestiona las guías de tus propiedades</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Crear Nueva Guía
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Guía</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGuide} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Propiedad</Label>
                  {properties.length === 0 ? (
                    <div className="p-3 border border-yellow-300 rounded-md bg-yellow-50">
                      <p className="text-sm text-yellow-800">
                        No hay propiedades disponibles para tu tenant. 
                        <br />
                        <Link href="/properties" className="text-blue-600 hover:underline">
                          Ve a Propiedades para crear una nueva.
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <select
                      id="property"
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Selecciona una propiedad</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

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
                    rows={3}
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

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={properties.length === 0}
                  >
                    Crear Guía
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {guides.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay guías creadas</h3>
              <p className="text-gray-600 mb-4">Crea tu primera guía del huésped para comenzar</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <i className="fas fa-plus mr-2"></i>
                Crear Primera Guía
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{guide.property.name}</CardTitle>
                    <Badge variant="secondary">Activa</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{guide.property.address}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Título</p>
                      <p className="text-sm text-gray-600">{guide.title}</p>
                    </div>
                    
                    {guide.host_names && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Anfitriones</p>
                        <p className="text-sm text-gray-600">{guide.host_names}</p>
                      </div>
                    )}

                    {guide.welcome_message && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mensaje</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{guide.welcome_message}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/properties/${guide.property_id}/guide`}>
                          <i className="fas fa-edit mr-2"></i>
                          Editar
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/properties/${guide.property_id}/guide/public`}>
                          <i className="fas fa-eye mr-2"></i>
                          Ver
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteGuide(guide.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}

export default function GuidesPage() {
  return (
    <Layout>
      <GuidesContent />
    </Layout>
  )
}
