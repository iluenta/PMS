import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock featured properties for the homepage
const featuredProperties = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "VeraTespera",
    location: "Vera, Almería",
    description: "Hermoso apartamento en Vera, perfecto para vacaciones en familia",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    has_guide: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Casa del Mar",
    location: "Vera, Almería",
    description: "Villa frente al mar con vistas espectaculares",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    has_guide: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Guías Interactivas para Propiedades Vacacionales
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 text-pretty max-w-3xl mx-auto">
            Crea experiencias memorables para tus huéspedes con guías personalizadas que incluyen todo lo que necesitan
            saber sobre tu propiedad y la zona.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Link href="/admin">
                <i className="fas fa-cog mr-2"></i>
                Panel de Administración
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
            >
              <Link href="#propiedades">
                <i className="fas fa-eye mr-2"></i>
                Ver Ejemplos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Todo lo que tus huéspedes necesitan</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Información completa sobre la propiedad, recomendaciones locales y contacto de emergencia, todo en una
              guía elegante y fácil de usar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-home text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Información de la Propiedad</h3>
                <p className="text-gray-600">
                  Normas de la casa, guía de funcionamiento y todo lo necesario para una estancia cómoda.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-map-marked-alt text-2xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Recomendaciones Locales</h3>
                <p className="text-gray-600">
                  Playas, restaurantes, actividades y todo lo mejor de la zona para una experiencia completa.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-edit text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Fácil de Editar</h3>
                <p className="text-gray-600">
                  Panel de administración intuitivo para actualizar contenido y mantener la información siempre
                  actualizada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="propiedades" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Propiedades de Ejemplo</h2>
            <p className="text-lg text-gray-600">Explora cómo se ven las guías interactivas en acción</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${property.image}')` }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={property.has_guide ? "default" : "secondary"}>
                      {property.has_guide ? "Con Guía" : "Sin Guía"}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{property.name}</span>
                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{property.location}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{property.description}</p>
                  <div className="flex gap-2">
                    {property.has_guide ? (
                      <Button asChild className="flex-1">
                        <Link href={`/${property.id}/guide`}>
                          <i className="fas fa-book-open mr-2"></i>
                          Ver Guía
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled className="flex-1">
                        <i className="fas fa-book mr-2"></i>
                        Guía no disponible
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/properties/${property.id}/edit`}>
                        <i className="fas fa-edit"></i>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Listo para crear tu primera guía?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Comienza a ofrecer una experiencia excepcional a tus huéspedes con guías personalizadas y profesionales.
            </p>
            <Button asChild size="lg">
              <Link href="/admin">
                <i className="fas fa-rocket mr-2"></i>
                Empezar Ahora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2024 Guías Interactivas. Sistema de gestión para propiedades vacacionales.</p>
        </div>
      </footer>
    </div>
  )
}
