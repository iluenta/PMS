"use client"

import { useState } from "react"
import { useGuideData } from "@/hooks/use-guide-data"
import { GuideHeader } from "@/components/guide-header"
import { WelcomeSection } from "@/components/welcome-section"
import { GuideTabs } from "@/components/guide-tabs"
import { ApartmentSection } from "@/components/sections/apartment-section"
import { HouseRulesSection } from "@/components/sections/house-rules-section"
import { HouseGuideSection } from "@/components/sections/house-guide-section"
import { BeachesSection } from "@/components/sections/beaches-section"
import { RestaurantsSection } from "@/components/sections/restaurants-section"
import { ActivitiesSection } from "@/components/sections/activities-section"
import { ContactSection } from "@/components/sections/contact-section"

interface GuidePageProps {
  params: {
    propertyId: string
  }
}

const tabs = [
  { id: "apartamento", label: "Apartamento", icon: "fas fa-home" },
  { id: "normas", label: "Normas", icon: "fas fa-clipboard-list" },
  { id: "guia-casa", label: "Guía Casa", icon: "fas fa-book" },
  { id: "consejos", label: "Consejos", icon: "fas fa-lightbulb" },
  { id: "playas", label: "Playas", icon: "fas fa-umbrella-beach" },
  { id: "restaurantes", label: "Restaurantes", icon: "fas fa-utensils" },
  { id: "actividades", label: "Actividades", icon: "fas fa-hiking" },
  { id: "practica", label: "Info Práctica", icon: "fas fa-info-circle" },
  { id: "contacto", label: "Contacto", icon: "fas fa-phone-alt" },
]

export default function GuidePage({ params }: GuidePageProps) {
  const [activeTab, setActiveTab] = useState("apartamento")
  const { data, loading, error } = useGuideData(params.propertyId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando guía...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error al cargar la guía</p>
        </div>
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case "apartamento":
        const apartmentSection = data.sections.find((s) => s.section_type === "apartment")
        return apartmentSection ? <ApartmentSection section={apartmentSection} property={data.property} /> : null
      case "normas":
        return <HouseRulesSection rules={data.house_rules} />
      case "guia-casa":
        return <HouseGuideSection items={data.house_guide_items} />
      case "consejos":
        const tipsSection = data.sections.find((s) => s.section_type === "tips")
        return tipsSection ? (
          <div className="py-12">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">{tipsSection.title}</h2>
                <p className="text-lg text-gray-700">{tipsSection.content}</p>
              </div>
            </div>
          </div>
        ) : null
      case "playas":
        return <BeachesSection beaches={data.beaches} />
      case "restaurantes":
        return <RestaurantsSection restaurants={data.restaurants} />
      case "actividades":
        return <ActivitiesSection activities={data.activities} />
      case "practica":
        return (
          <div className="py-12">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Información Práctica</h2>
                <p className="text-lg text-gray-700">Información útil para tu estancia en Vera.</p>
              </div>
            </div>
          </div>
        )
      case "contacto":
        return <ContactSection contactInfo={data.contact_info} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <GuideHeader guide={data.guide} />
      <WelcomeSection guide={data.guide} />
      <GuideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {renderActiveSection()}
    </div>
  )
}
