"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Layout } from "@/components/Layout"
import { HouseRulesManager } from "@/components/admin/HouseRulesManager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getGuide, getCompleteGuideData } from "@/lib/guides"
import { Guide } from "@/types/guides"
import Link from "next/link"

export default function EditPropertyPage() {
  const params = useParams()
  const propertyId = params.id as string
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("rules")

  useEffect(() => {
    loadGuideData()
  }, [propertyId])

  const loadGuideData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Intentar obtener la guía existente
      const guideData = await getGuide(propertyId)
      
      if (guideData) {
        setGuide(guideData)
      } else {
        // Si no existe guía, crear una básica
        console.log('No guide found, will need to create one')
        setGuide(null)
      }
    } catch (err) {
      console.error('Error loading guide data:', err)
      setError('Error al cargar los datos de la guía')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-600">{error}</p>
            <Button onClick={loadGuideData} className="mt-4">
              <i className="fas fa-refresh mr-2"></i>
              Reintentar
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!guide) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">No se encontró una guía para esta propiedad</p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              Primero necesitas crear una guía del viajero para esta propiedad
            </p>
            <Button asChild>
              <Link href={`/properties/${propertyId}/guide`}>
                <i className="fas fa-plus mr-2"></i>
                Crear Guía
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/properties">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Volver a Propiedades
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editar Guía: {guide.title}</h1>
                  <p className="text-sm text-gray-600">Propiedad ID: {propertyId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/properties/${propertyId}/guide`}>
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
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="rules" className="text-xs">
                <i className="fas fa-clipboard-list mr-2"></i>
                Normas
              </TabsTrigger>
              <TabsTrigger value="guide" className="text-xs">
                <i className="fas fa-book mr-2"></i>
                Guía
              </TabsTrigger>
              <TabsTrigger value="sections" className="text-xs">
                <i className="fas fa-list mr-2"></i>
                Secciones
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-xs">
                <i className="fas fa-chart-bar mr-2"></i>
                Resumen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-clipboard-list text-blue-600"></i>
                      Gestión de Normas de la Casa
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Aquí puedes crear y gestionar múltiples normas individuales para tu propiedad.
                      Cada norma puede tener su propio título, descripción e icono.
                    </p>
                  </CardHeader>
                </Card>
                
                <HouseRulesManager guideId={guide.id} />
              </div>
            </TabsContent>

            <TabsContent value="guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-book text-blue-600"></i>
                    Información de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Título</label>
                      <p className="text-gray-900">{guide.title}</p>
                    </div>
                    {guide.welcome_message && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mensaje de Bienvenida</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{guide.welcome_message}</p>
                      </div>
                    )}
                    {guide.host_names && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nombres del Anfitrión</label>
                        <p className="text-gray-900">{guide.host_names}</p>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Creado: {new Date(guide.created_at).toLocaleDateString()}
                      {guide.updated_at !== guide.created_at && (
                        <span> • Actualizado: {new Date(guide.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-list text-blue-600"></i>
                    Secciones de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <i className="fas fa-tools text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">Gestión de secciones próximamente</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta funcionalidad estará disponible en futuras actualizaciones
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-chart-bar text-blue-600"></i>
                    Resumen de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <i className="fas fa-clipboard-list text-2xl text-blue-600 mb-2"></i>
                      <p className="font-medium text-gray-900">Normas</p>
                      <p className="text-sm text-gray-600">Gestionar múltiples normas</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <i className="fas fa-book text-2xl text-green-600 mb-2"></i>
                      <p className="font-medium text-gray-900">Guía</p>
                      <p className="text-sm text-gray-600">Información básica</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <i className="fas fa-list text-2xl text-purple-600 mb-2"></i>
                      <p className="font-medium text-gray-900">Secciones</p>
                      <p className="text-sm text-gray-600">Próximamente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
