"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { GuideData } from "@/types/guide"

interface ContentOverviewProps {
  data: GuideData
  onNavigateToTab: (tab: string) => void
}

export function ContentOverview({ data, onNavigateToTab }: ContentOverviewProps) {
  const contentStats = [
    {
      title: "Playas",
      count: data.beaches.length,
      icon: "fas fa-umbrella-beach",
      tab: "beaches",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Restaurantes",
      count: data.restaurants.length,
      icon: "fas fa-utensils",
      tab: "restaurants",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Actividades",
      count: data.activities.length,
      icon: "fas fa-hiking",
      tab: "activities",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Normas",
      count: data.house_rules.length,
      icon: "fas fa-clipboard-list",
      tab: "rules",
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Guía Casa",
      count: data.house_guide_items.length,
      icon: "fas fa-book",
      tab: "house-guide",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Secciones",
      count: data.sections.length,
      icon: "fas fa-list",
      tab: "sections",
      color: "bg-indigo-100 text-indigo-600",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-chart-bar text-blue-600"></i>
            Resumen del Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {contentStats.map((stat) => (
              <div
                key={stat.tab}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigateToTab(stat.tab)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <i className={stat.icon}></i>
                  </div>
                  <Badge variant="secondary">{stat.count}</Badge>
                </div>
                <h4 className="font-medium text-sm">{stat.title}</h4>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-tasks text-blue-600"></i>
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => onNavigateToTab("beaches")}
              >
                <i className="fas fa-plus mr-2"></i>
                Agregar Nueva Playa
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => onNavigateToTab("restaurants")}
              >
                <i className="fas fa-plus mr-2"></i>
                Agregar Restaurante
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => onNavigateToTab("activities")}
              >
                <i className="fas fa-plus mr-2"></i>
                Agregar Actividad
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => onNavigateToTab("sections")}
              >
                <i className="fas fa-plus mr-2"></i>
                Agregar Sección Personalizada
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-600"></i>
              Estado de la Guía
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Información Básica</span>
                <Badge variant={data.property.name ? "default" : "secondary"}>
                  {data.property.name ? "Completa" : "Pendiente"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Contenido de Playas</span>
                <Badge variant={data.beaches.length > 0 ? "default" : "secondary"}>
                  {data.beaches.length > 0 ? "Completo" : "Vacío"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Restaurantes</span>
                <Badge variant={data.restaurants.length > 0 ? "default" : "secondary"}>
                  {data.restaurants.length > 0 ? "Completo" : "Vacío"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Información de Contacto</span>
                <Badge variant={data.contact_info.phone ? "default" : "secondary"}>
                  {data.contact_info.phone ? "Completa" : "Pendiente"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
