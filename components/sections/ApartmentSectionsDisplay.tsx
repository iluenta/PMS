"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApartmentSection } from "@/types/guides"

// Iconos por defecto para cada tipo de sección
const SECTION_TYPE_ICONS = {
  cocina: "fas fa-utensils",
  bano: "fas fa-shower",
  salon: "fas fa-couch",
  dormitorio: "fas fa-bed",
  terraza: "fas fa-sun",
  entrada: "fas fa-door-open",
  balcon: "fas fa-wind",
  garaje: "fas fa-car",
} as const

// Etiquetas para cada tipo de sección
const SECTION_TYPE_LABELS = {
  cocina: "Cocina",
  bano: "Baño",
  salon: "Salón",
  dormitorio: "Dormitorio",
  terraza: "Terraza",
  entrada: "Entrada",
  balcon: "Balcón",
  garaje: "Garaje",
} as const

// Colores para cada tipo de sección
const SECTION_TYPE_COLORS = {
  cocina: "text-orange-500",
  bano: "text-blue-500",
  salon: "text-purple-500",
  dormitorio: "text-pink-500",
  terraza: "text-yellow-500",
  entrada: "text-gray-500",
  balcon: "text-green-500",
  garaje: "text-indigo-500",
} as const

interface ApartmentSectionsDisplayProps {
  sections: ApartmentSection[]
}

export function ApartmentSectionsDisplay({ sections }: ApartmentSectionsDisplayProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Detalles del Apartamento
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Descubre todas las áreas y comodidades de tu hogar temporal
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              // Usar el icono de la base de datos si existe, sino usar el por defecto
              const finalIcon = section.icon || SECTION_TYPE_ICONS[section.section_type]
              
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <i 
                          className={`${finalIcon} text-lg ${SECTION_TYPE_COLORS[section.section_type]}`}
                        ></i>
                        <Badge variant="secondary" className="text-xs">
                          {SECTION_TYPE_LABELS[section.section_type]}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h3>
                    <p className="text-gray-600 text-sm">{section.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}