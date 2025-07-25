"use client"

import { TravelerGuide } from "@/components/TravelerGuide"
import { mockData } from "@/lib/supabase"

export default function DemoGuidePage() {
  // Use the first property for demo
  const demoProperty = mockData.properties[0]
  const demoSections = mockData.travelerGuideSections.filter((section) => section.property_id === demoProperty.id)
  const demoItems = mockData.travelerGuideItems

  // Enhanced demo data with more visual content
  const enhancedSections = demoSections.map((section) => ({
    ...section,
    items: demoItems.filter((item) => item.section_id === section.id),
  }))

  // Add demo banner
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
        <div className="animate-pulse">
          <h2 className="text-lg font-bold">🎯 DEMOSTRACIÓN - Guía del Viajero</h2>
          <p className="text-sm opacity-90">
            Esta es una vista previa de cómo los huéspedes verían la guía en sus móviles
          </p>
        </div>
      </div>

      {/* Enhanced content with emojis and better formatting */}
      <TravelerGuide
        property={{
          ...demoProperty,
          name: `🏠 ${demoProperty.name}`,
          description: `✨ ${demoProperty.description}`,
        }}
        sections={enhancedSections.map((section) => ({
          ...section,
          title:
            section.section_type === "checkin"
              ? `🔑 ${section.title}`
              : section.section_type === "apartment_info"
                ? `🏡 ${section.title}`
                : section.section_type === "places_to_visit"
                  ? `🗺️ ${section.title}`
                  : section.section_type === "restaurants"
                    ? `🍽️ ${section.title}`
                    : section.section_type === "emergency_contacts"
                      ? `🚨 ${section.title}`
                      : section.section_type === "house_rules"
                        ? `📋 ${section.title}`
                        : section.title,
          content:
            section.section_type === "checkin"
              ? `🕒 El check-in es a partir de las 15:00h.\n\n🔐 Encontrarás las llaves en la caja fuerte ubicada en la entrada del edificio (Código: 1234).\n\n📶 WiFi: "Madrid_Guest" - Contraseña: "Welcome2024"\n\n📱 El código de acceso te será enviado el día de tu llegada.`
              : section.section_type === "apartment_info"
                ? `🛏️ Apartamento de 2 habitaciones en pleno centro de Madrid.\n\n❄️ Aire acondicionado disponible\n🍳 Cocina completamente equipada\n📺 Smart TV con Netflix\n🧺 Lavadora disponible\n\n🎯 Ubicación perfecta para explorar la ciudad`
                : section.content,
          items: section.items?.map((item) => ({
            ...item,
            title:
              section.section_type === "places_to_visit"
                ? `🏛️ ${item.title}`
                : section.section_type === "restaurants"
                  ? `🍴 ${item.title}`
                  : item.title,
            image_url:
              section.section_type === "places_to_visit"
                ? item.title.includes("Prado")
                  ? "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop"
                  : "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop"
                : section.section_type === "restaurants"
                  ? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
                  : item.image_url,
          })),
        }))}
      />
    </div>
  )
}
