"use client"

import { useState } from "react"
import { useGuideData } from "@/hooks/use-guide-data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PropertyEditForm } from "@/components/admin/property-edit-form"
import { GuideEditForm } from "@/components/admin/guide-edit-form"
import { BeachesEditForm } from "@/components/admin/beaches-edit-form"
import { RestaurantsEditForm } from "@/components/admin/restaurants-edit-form"
import { ActivitiesEditForm } from "@/components/admin/activities-edit-form"
import { HouseRulesEditForm } from "@/components/admin/house-rules-edit-form"
import { HouseGuideEditForm } from "@/components/admin/house-guide-edit-form"
import { ContactEditForm } from "@/components/admin/contact-edit-form"
import { SectionManager } from "@/components/admin/section-manager"
import { PracticalInfoEditForm } from "@/components/admin/practical-info-edit-form"
import { ContentOverview } from "@/components/admin/content-overview"
import Link from "next/link"

interface EditPropertyPageProps {
  params: {
    propertyId: string
  }
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { data, loading, error } = useGuideData(params.propertyId)
  const [activeTab, setActiveTab] = useState("overview")

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

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error al cargar los datos</p>
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
                <Link href="/admin">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Volver
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar: {data.property.name}</h1>
                <p className="text-sm text-gray-600">{data.property.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/${params.propertyId}/guide`}>
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
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            <TabsTrigger value="overview" className="text-xs">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="property" className="text-xs">
              Propiedad
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-xs">
              Guía
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-xs">
              Secciones
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
            <TabsTrigger value="rules" className="text-xs">
              Normas
            </TabsTrigger>
            <TabsTrigger value="house-guide" className="text-xs">
              Guía Casa
            </TabsTrigger>
            <TabsTrigger value="practical" className="text-xs">
              Info Práctica
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">
              Contacto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ContentOverview data={data} onNavigateToTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="property">
            <PropertyEditForm property={data.property} />
          </TabsContent>

          <TabsContent value="guide">
            <GuideEditForm guide={data.guide} sections={data.sections} />
          </TabsContent>

          <TabsContent value="sections">
            <SectionManager sections={data.sections} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="beaches">
            <BeachesEditForm beaches={data.beaches} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="restaurants">
            <RestaurantsEditForm restaurants={data.restaurants} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesEditForm activities={data.activities} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="rules">
            <HouseRulesEditForm rules={data.house_rules} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="house-guide">
            <HouseGuideEditForm items={data.house_guide_items} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="practical">
            <PracticalInfoEditForm practicalInfo={data.practical_info} guideId={data.guide.id} />
          </TabsContent>

          <TabsContent value="contact">
            <ContactEditForm contactInfo={data.contact_info} guideId={data.guide.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
