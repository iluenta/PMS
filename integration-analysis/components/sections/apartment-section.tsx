import type { GuideSection, Property } from "@/types/guide"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ApartmentSectionProps {
  section: GuideSection
  property: Property
}

export function ApartmentSection({ section, property }: ApartmentSectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{section.title}</h2>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-blue-600"></i>
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700">{property.address}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')",
                }}
              >
                <div className="h-full bg-black/20 flex items-end p-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    Apartamento Completo
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Espacios Cómodos</h3>
                <p className="text-gray-600">
                  Apartamento completamente equipado con todas las comodidades necesarias para una estancia perfecta.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')",
                }}
              >
                <div className="h-full bg-black/20 flex items-end p-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    Totalmente Equipado
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Cocina Completa</h3>
                <p className="text-gray-600">
                  Cocina totalmente equipada con todos los utensilios y electrodomésticos necesarios.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
