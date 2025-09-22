"use client"

import { useState, useEffect } from "react"
import { useGuideData } from "@/hooks/useGuideData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApartmentSectionsDisplay } from "@/components/sections/ApartmentSectionsDisplay"

interface GuidePublicPageProps {
  params: Promise<{ id: string }>
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

export default function GuidePublicPage({ params }: GuidePublicPageProps) {
  return <GuidePublicContent params={params} />
}

function GuidePublicContent({ params }: GuidePublicPageProps) {
  const [propertyId, setPropertyId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("apartamento")

  // Resolver params usando useEffect
  useEffect(() => {
    params.then(({ id }) => setPropertyId(id))
  }, [params])

  const { data, loading, error } = useGuideData(propertyId)

  // Debug: Log data structure
  useEffect(() => {
    if (data) {
      console.log('=== GUIDE DATA DEBUG ===')
      console.log('Guide:', data.guide)
      console.log('Welcome message:', data.guide?.welcome_message)
      console.log('Host signature:', data.guide?.host_signature)
      console.log('Property name:', data.property?.name)
      console.log('=== END DEBUG ===')
    }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando guía...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error al cargar la guía</p>
          <p className="text-sm text-gray-500 mt-2">La guía no está disponible en este momento</p>
        </div>
      </div>
    )
  }

  const showSection = (sectionId: string) => {
    setActiveTab(sectionId)
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case "apartamento":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Tu Hogar en Vera</h2>
              <ApartmentSectionsDisplay sections={data.apartment_sections} />
            </div>
          </section>
        )

      case "normas":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Normas de la Casa</h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                Para garantizar una estancia agradable para todos, te pedimos que respetes las siguientes normas:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.house_rules.map((rule) => (
                  <div key={rule.id} className="bg-white rounded-lg shadow-lg p-6 text-center transition-transform hover:transform hover:-translate-y-2 border-t-4 border-blue-500">
                    <i className={`${rule.icon} text-4xl text-blue-500 mb-4`}></i>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{rule.title}</h3>
                    <p className="text-gray-600">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "guia-casa":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Guía de la Casa</h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                Todo lo que necesitas saber sobre el funcionamiento del apartamento:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.house_guide_items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <i className={`${item.icon} text-yellow-500 mr-3`}></i>
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    {item.details && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <p className="text-sm text-gray-700 font-medium">
                          <strong>Consejo:</strong> {item.details}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "consejos":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Consejos para tu Estancia</h2>
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                Recomendaciones para aprovechar al máximo las instalaciones durante tu visita:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.tips.map((tip) => (
                  <div key={tip.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:-translate-y-2">
                    <div className="bg-blue-600 text-white p-4 flex items-center">
                      <i className={`${tip.icon} text-xl mr-3`}></i>
                      <h3 className="text-lg font-semibold">{tip.title}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">{tip.description}</p>
                      {tip.details && (
                        <div className="bg-blue-50 rounded-lg p-3 border-l-3 border-yellow-400">
                          <p className="text-sm text-gray-700 font-medium">
                            <strong>Tip:</strong> {tip.details}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {data.tips.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-lightbulb text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No hay consejos disponibles en este momento</p>
                </div>
              )}
            </div>
          </section>
        )

      case "playas":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Playas de Vera</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.beaches.map((beach) => (
                  <div key={beach.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:-translate-y-2">
                    {beach.image_url && (
                      <div className="h-48 bg-gray-200 relative">
                        <img 
                          src={beach.image_url} 
                          alt={beach.name}
                          className="w-full h-full object-cover"
                        />
                        {beach.badge && (
                          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {beach.badge}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{beach.name}</h3>
                      <p className="text-gray-600 mb-4">{beach.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <i className="fas fa-walking mr-2"></i>
                          {beach.distance}
                        </span>
                        {beach.rating && (
                          <div className="flex items-center text-yellow-500">
                            <i className="fas fa-star mr-1"></i>
                            <span className="text-gray-700">{beach.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "restaurantes":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Restaurantes Recomendados</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:-translate-y-2">
                    {restaurant.image_url && (
                      <div className="h-48 bg-gray-200 relative">
                        <img 
                          src={restaurant.image_url} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        {restaurant.badge && (
                          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {restaurant.badge}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{restaurant.name}</h3>
                      <p className="text-gray-600 mb-4">{restaurant.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <i className="fas fa-euro-sign mr-2"></i>
                          {restaurant.price_range}
                        </span>
                        {restaurant.rating && (
                          <div className="flex items-center text-yellow-500">
                            <i className="fas fa-star mr-1"></i>
                            <span className="text-gray-700">{restaurant.rating}</span>
                            {restaurant.review_count && (
                              <span className="ml-1 text-gray-500">({restaurant.review_count})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "actividades":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Actividades y Atracciones</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.activities.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:-translate-y-2">
                    {activity.image_url && (
                      <div className="h-48 bg-gray-200 relative">
                        <img 
                          src={activity.image_url} 
                          alt={activity.name}
                          className="w-full h-full object-cover"
                        />
                        {activity.badge && (
                          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {activity.badge}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">{activity.name}</h3>
                      <p className="text-gray-600 mb-4">{activity.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <i className="fas fa-walking mr-2"></i>
                          {activity.distance}
                        </span>
                        <span className="flex items-center font-medium text-green-600">
                          <i className="fas fa-ticket-alt mr-2"></i>
                          {activity.price_info}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "practica":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Información Práctica</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.practical_info.map((info) => (
                  <div key={info.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:-translate-y-2">
                    <div className="h-48 bg-gray-200 relative">
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {info.title}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <i className={`${info.icon} text-blue-500 mr-3`}></i>
                        {info.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{info.description}</p>
                      {info.details && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(info.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "contacto":
        return (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Contacto y Emergencias</h2>
              
              {data.contact_info && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-user text-blue-500 mr-3"></i>
                        Tus Anfitriones
                      </h3>
                      <p className="text-gray-600 mb-4">{data.contact_info.host_names}</p>
                      <div className="space-y-3">
                        {data.contact_info.phone && (
                          <p className="text-gray-600 flex items-center">
                            <i className="fas fa-phone text-blue-500 mr-3"></i>
                            {data.contact_info.phone}
                          </p>
                        )}
                        {data.contact_info.email && (
                          <p className="text-gray-600 flex items-center">
                            <i className="fas fa-envelope text-blue-500 mr-3"></i>
                            {data.contact_info.email}
                          </p>
                        )}
                        {data.contact_info.whatsapp && (
                          <p className="text-gray-600 flex items-center">
                            <i className="fab fa-whatsapp text-green-500 mr-3"></i>
                            {data.contact_info.whatsapp}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-phone-alt text-red-500 mr-3"></i>
                        Emergencias
                      </h3>
                      {data.contact_info.emergency_numbers && (
                        <div className="space-y-3">
                          <p className="text-gray-600">
                            <strong>Emergencias:</strong> {data.contact_info.emergency_numbers.emergencias}
                          </p>
                          <p className="text-gray-600">
                            <strong>Policía Local:</strong> {data.contact_info.emergency_numbers.policia_local}
                          </p>
                          <p className="text-gray-600">
                            <strong>Guardia Civil:</strong> {data.contact_info.emergency_numbers.guardia_civil}
                          </p>
                          <p className="text-gray-600">
                            <strong>Bomberos:</strong> {data.contact_info.emergency_numbers.bomberos}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {data.contact_info.service_issues && data.contact_info.service_issues.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Para Reportar Incidencias</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        {data.contact_info.service_issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a5f, #3498db)',
        color: 'white',
        padding: '40px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
          zIndex: -1
        }}></div>
        <div className="container mx-auto px-6" style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{
            fontSize: '2.8rem',
            marginBottom: '10px',
            fontWeight: 700,
            fontFamily: "'Montserrat', sans-serif"
          }}>
            {data.guide.title || "Guía del Huésped"}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Tu compañero esencial para disfrutar al máximo tu estancia en {data.property.name || "VeraTespera"}
          </p>
        </div>
      </header>

      {/* Welcome Section */}
      <section style={{
        padding: '40px 0',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div className="container mx-auto px-6">
          <h2 style={{
            color: '#1e3a5f',
            marginBottom: '20px',
            fontSize: '2rem',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600
          }}>
            Bienvenido a {data.property.name || "VeraTespera"}
          </h2>
          <p style={{
            maxWidth: '800px',
            margin: '0 auto',
            fontSize: '1.1rem',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            {data.guide.welcome_message || 
              "¡Hola! Somos Sonia y Pedro, tus anfitriones en VeraTespera. Hemos preparado esta guía para que disfrutes al máximo tu estancia en nuestro apartamento y en la maravillosa zona de Vera. Aquí encontrarás toda la información que necesitas para organizar tu viaje y descubrir los mejores lugares de la zona."
            }
          </p>
          <p style={{
            marginTop: '20px',
            fontStyle: 'italic',
            fontWeight: 500,
            fontFamily: "'Montserrat', sans-serif"
          }}>
            {data.guide.host_signature || "Con cariño, Sonia y Pedro"}
          </p>
        </div>
      </section>


      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          backgroundColor: '#1e3a5f',
          marginBottom: '30px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => showSection(tab.id)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '15px 10px',
                textAlign: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRight: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: activeTab === tab.id ? '#f4d03f' : 'transparent',
                ...(activeTab === tab.id && {
                  color: '#1e3a5f',
                  fontWeight: 600
                })
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <i 
                className={tab.icon} 
                style={{
                  display: 'block',
                  fontSize: '1.5rem',
                  marginBottom: '5px'
                }}
              ></i>
              <span style={{ fontSize: '0.875rem' }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Section */}
        {renderActiveSection()}
      </div>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <i className="fas fa-heart text-2xl text-red-400 mb-4"></i>
          </div>
          <h3 className="text-2xl font-bold mb-4">¡Disfruta de tu estancia!</h3>
          <p className="text-blue-100 mb-6">© 2025 {data.property.name} - Todos los derechos reservados</p>
          <div className="flex justify-center space-x-8 text-sm text-blue-200">
            <span><i className="fas fa-home mr-2"></i>Tu hogar lejos de casa</span>
            <span><i className="fas fa-star mr-2"></i>Experiencia única</span>
            <span><i className="fas fa-map-marker-alt mr-2"></i>Ubicación privilegiada</span>
          </div>
        </div>
      </footer>
    </div>
  )
}