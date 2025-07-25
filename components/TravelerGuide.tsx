"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  supabase,
  isDemoMode,
  mockData,
  type Property,
  type TravelerGuideSection,
  type TravelerGuideItem,
} from "@/lib/supabase"
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Home,
  AlertTriangle,
  Utensils,
  Camera,
  ExternalLink,
  Info,
  Shield,
} from "lucide-react"

interface TravelerGuideProps {
  propertyId: string
}

export default function TravelerGuide({ propertyId }: TravelerGuideProps) {
  const [property, setProperty] = useState<Property | null>(null)
  const [sections, setSections] = useState<TravelerGuideSection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    fetchGuideData()
  }, [propertyId])

  const fetchGuideData = async () => {
    try {
      if (isDemoMode) {
        const propertyData = mockData.properties.find((p) => p.id === propertyId)

        // Enhanced mock data with more visual content
        const enhancedSections = [
          {
            id: "tgs1",
            property_id: propertyId,
            section_type: "checkin",
            title: "Información de Check-in",
            content:
              "✅ Check-in: 15:00h - 20:00h\n🔑 Las llaves están en la caja fuerte del edificio\n📱 Te enviaremos el código por WhatsApp\n🚗 Parking público a 100m",
            order_index: 1,
            is_active: true,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
            items: [],
          },
          {
            id: "tgs2",
            property_id: propertyId,
            section_type: "apartment_info",
            title: "Tu Apartamento",
            content:
              "🏠 Apartamento de 2 habitaciones en pleno centro\n📶 WiFi: PMS_Guest / Password: welcome123\n❄️ Aire acondicionado en todas las habitaciones\n🍳 Cocina completamente equipada",
            order_index: 2,
            is_active: true,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
            items: [],
          },
          {
            id: "tgs3",
            property_id: propertyId,
            section_type: "places_to_visit",
            title: "Lugares que Visitar",
            content: "Los mejores lugares de Madrid están a tu alcance 🎨",
            order_index: 3,
            is_active: true,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
            items: [
              {
                id: "tgi1",
                section_id: "tgs3",
                title: "Museo del Prado",
                description:
                  "🎨 Uno de los museos más importantes del mundo. Obras de Velázquez, Goya y El Greco. ¡Imprescindible!",
                address: "Calle de Ruiz de Alarcón, 23, 28014 Madrid",
                phone: "",
                website: "https://www.museodelprado.es",
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
                order_index: 1,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
              {
                id: "tgi2",
                section_id: "tgs3",
                title: "Parque del Retiro",
                description:
                  "🌳 Hermoso parque en el centro de Madrid. Perfecto para pasear, hacer picnic o simplemente relajarse.",
                address: "Plaza de la Independencia, 7, 28001 Madrid",
                phone: "",
                website: "",
                image_url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop",
                order_index: 2,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
              {
                id: "tgi3",
                section_id: "tgs3",
                title: "Puerta del Sol",
                description:
                  "🏛️ El corazón de Madrid y punto de encuentro más famoso. Aquí está el kilómetro 0 de España.",
                address: "Puerta del Sol, 28013 Madrid",
                phone: "",
                website: "",
                image_url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=300&fit=crop",
                order_index: 3,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
            ],
          },
          {
            id: "tgs4",
            property_id: propertyId,
            section_type: "restaurants",
            title: "Restaurantes Recomendados",
            content: "🍽️ Los mejores sabores de Madrid cerca de ti",
            order_index: 4,
            is_active: true,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
            items: [
              {
                id: "tgi4",
                section_id: "tgs4",
                title: "Casa Botín",
                description:
                  "🏆 El restaurante más antiguo del mundo según Guinness. Especialidad en cochinillo asado. Reserva imprescindible.",
                address: "Calle de Cuchilleros, 17, 28005 Madrid",
                phone: "+34 913 66 42 17",
                website: "https://www.botin.es",
                image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
                order_index: 1,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
              {
                id: "tgi5",
                section_id: "tgs4",
                title: "Mercado de San Miguel",
                description:
                  "🥘 Mercado gourmet con gran variedad de tapas y productos locales. Perfecto para probar de todo.",
                address: "Plaza de San Miguel, s/n, 28005 Madrid",
                phone: "+34 915 42 49 36",
                website: "",
                image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
                order_index: 2,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
              {
                id: "tgi6",
                section_id: "tgs4",
                title: "Taberna La Bola",
                description:
                  "🍲 Taberna tradicional madrileña famosa por su cocido madrileño. Ambiente auténtico desde 1870.",
                address: "Calle de la Bola, 5, 28013 Madrid",
                phone: "+34 915 47 69 30",
                website: "",
                image_url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
                order_index: 3,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
            ],
          },
          {
            id: "tgs5",
            property_id: propertyId,
            section_type: "emergency_contacts",
            title: "Contactos de Emergencia",
            content: "📞 Números importantes para tu seguridad",
            order_index: 5,
            is_active: true,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
            items: [
              {
                id: "tgi7",
                section_id: "tgs5",
                title: "🚨 Emergencias Generales",
                description: "Policía, Bomberos, Ambulancia - Llamada gratuita 24h",
                address: "",
                phone: "112",
                website: "",
                image_url: "",
                order_index: 1,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
              {
                id: "tgi8",
                section_id: "tgs5",
                title: "👮 Policía Nacional",
                description: "Para denuncias y emergencias policiales",
                address: "",
                phone: "091",
                website: "",
                image_url: "",
                order_index: 2,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
              {
                id: "tgi9",
                section_id: "tgs5",
                title: "🏠 Tu Anfitrión - María",
                description: "Contacto directo para cualquier duda sobre el apartamento",
                address: "",
                phone: "+34 600 123 456",
                website: "",
                image_url: "",
                order_index: 3,
                is_active: true,
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
              },
            ],
          },
          {
            id: "tgs6",
            property_id: propertyId,
            section_type: "house_rules",
            title: "Normas de la Casa",
            content:
              "🏠 Para garantizar una estancia agradable para todos:\n\n🚭 No se permite fumar en el interior\n🔇 Horario de silencio: 22:00 - 8:00h\n👥 Máximo 4 huéspedes\n🎉 No se permiten fiestas\n🧹 Mantén el apartamento limpio\n🔑 Cierra siempre con llave al salir\n📱 Avisa si vas a llegar después de las 20:00h",
            order_index: 6,
            is_active: true,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
            items: [],
          },
        ]

        setProperty(propertyData || null)
        setSections(enhancedSections)
        if (enhancedSections.length > 0) {
          setActiveSection(enhancedSections[0].id)
        }
        return
      }

      // Fetch property data
      const { data: propertyData } = await supabase.from("properties").select("*").eq("id", propertyId).single()

      // Fetch guide sections with items
      const { data: sectionsData } = await supabase
        .from("traveler_guide_sections")
        .select(`
          *,
          items:traveler_guide_items(*)
        `)
        .eq("property_id", propertyId)
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (propertyData) setProperty(propertyData)
      if (sectionsData) {
        const processedSections = sectionsData.map((section) => ({
          ...section,
          items:
            section.items
              ?.filter((item: TravelerGuideItem) => item.is_active)
              .sort((a: TravelerGuideItem, b: TravelerGuideItem) => a.order_index - b.order_index) || [],
        }))
        setSections(processedSections)
        if (processedSections.length > 0) {
          setActiveSection(processedSections[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching guide data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return <Clock className="h-5 w-5" />
      case "apartment_info":
        return <Home className="h-5 w-5" />
      case "places_to_visit":
        return <Camera className="h-5 w-5" />
      case "restaurants":
        return <Utensils className="h-5 w-5" />
      case "emergency_contacts":
        return <AlertTriangle className="h-5 w-5" />
      case "house_rules":
        return <Shield className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getSectionColor = (type: string) => {
    switch (type) {
      case "checkin":
        return "text-blue-600 bg-blue-50"
      case "apartment_info":
        return "text-green-600 bg-green-50"
      case "places_to_visit":
        return "text-purple-600 bg-purple-50"
      case "restaurants":
        return "text-orange-600 bg-orange-50"
      case "emergency_contacts":
        return "text-red-600 bg-red-50"
      case "house_rules":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const activeSecData = sections.find((s) => s.id === activeSection)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Propiedad no encontrada</h2>
            <p className="text-gray-600">No se pudo cargar la información de la propiedad.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with property info */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center space-x-4">
            {property.cover_image && (
              <img
                src={property.cover_image || "/placeholder.svg"}
                alt={property.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{property.name}</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.city}, {property.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto p-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">🚀 MODO DEMO</span>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-center text-xs mt-1 opacity-90">
              Esta es una demostración de la Guía del Viajero - Interfaz optimizada para móvil
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Navigation tabs - Mobile optimized */}
        <div className="mb-6">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? `${getSectionColor(section.section_type)} border-2 border-current`
                    : "text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {getSectionIcon(section.section_type)}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active section content */}
        {activeSecData && (
          <div className="space-y-4">
            <Card>
              <CardHeader className={`${getSectionColor(activeSecData.section_type)} rounded-t-lg`}>
                <div className="flex items-center space-x-3">
                  {getSectionIcon(activeSecData.section_type)}
                  <div>
                    <CardTitle className="text-lg">{activeSecData.title}</CardTitle>
                    {activeSecData.content && (
                      <CardDescription className="mt-2 text-current opacity-80">
                        {activeSecData.content}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Section items */}
            {activeSecData.items && activeSecData.items.length > 0 && (
              <div className="space-y-3">
                {activeSecData.items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {item.image_url && (
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          {item.description && <p className="text-sm text-gray-600 mb-3">{item.description}</p>}

                          <div className="space-y-2">
                            {item.address && (
                              <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{item.address}</span>
                              </div>
                            )}

                            {item.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <a href={`tel:${item.phone}`} className="text-sm text-blue-600 hover:underline">
                                  {item.phone}
                                </a>
                              </div>
                            )}

                            {item.website && (
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <a
                                  href={item.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center"
                                >
                                  Visitar sitio web
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Action buttons for specific types */}
                          <div className="flex space-x-2 mt-3">
                            {item.address && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const encodedAddress = encodeURIComponent(item.address!)
                                  window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank")
                                }}
                                className="text-xs"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                Ver en mapa
                              </Button>
                            )}

                            {item.phone && activeSecData.section_type === "emergency_contacts" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${item.phone}`, "_self")}
                                className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                Llamar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Special content for house rules */}
            {activeSecData.section_type === "house_rules" && activeSecData.content && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-2">Normas importantes</h3>
                      <div className="text-sm text-orange-800 whitespace-pre-line">{activeSecData.content}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {sections.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Guía no disponible</h3>
              <p className="text-gray-500">La guía del viajero aún no está configurada para esta propiedad.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
        <div className="flex justify-center">
          <Badge variant="secondary" className="px-4 py-2">
            Desliza para ver más secciones
          </Badge>
        </div>
      </div>
    </div>
  )
}
