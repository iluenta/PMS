import type { GuideData } from "@/types/guide"

// Mock data based on our SQL sample data
const mockGuideData: GuideData = {
  property: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "VeraTespera",
    address: "Calle Ejemplo, 123, 04620 Vera, Almería",
    description: "Hermoso apartamento en Vera, perfecto para vacaciones en familia",
  },
  guide: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    property_id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Guía del Huésped",
    welcome_message:
      "¡Hola! Somos Sonia y Pedro, tus anfitriones en VeraTespera. Hemos preparado esta guía para que disfrutes al máximo tu estancia en nuestro apartamento y en la maravillosa zona de Vera. Aquí encontrarás toda la información que necesitas para organizar tu viaje y descubrir los mejores lugares de la zona.",
    host_names: "Sonia y Pedro",
    host_signature: "Con cariño, Sonia y Pedro",
  },
  sections: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "apartment",
      title: "Tu Hogar en Vera",
      content:
        "Bienvenido a tu hogar temporal en Vera. Nuestro apartamento está completamente equipado para que tengas una estancia cómoda y memorable.",
      order_index: 1,
      is_active: true,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "tips",
      title: "Consejos para tu Estancia",
      content: "Aquí tienes algunos consejos útiles para aprovechar al máximo tu tiempo en Vera y sus alrededores.",
      order_index: 2,
      is_active: true,
    },
  ],
  beaches: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "El Playazo",
      description:
        "La playa más grande e importante de Vera, con más de 2 kilómetros de longitud. Arena fina y dorada con todos los servicios: paseo marítimo, restaurantes, chiringuitos y club de playa.",
      distance: "15 min caminando",
      rating: 4.5,
      badge: "Recomendada",
      image_url:
        "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 1,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Playa de Las Marinas – Bolaga",
      description:
        "Playa de 1.775 metros con paseo marítimo ajardinado, carril bici y zonas de juego infantil. Cuenta con la certificación Q de calidad y chiringuitos para comer.",
      distance: "5 min en coche",
      rating: 4.3,
      badge: "Familiar",
      image_url:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 2,
    },
    {
      id: "3",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Playa de Puerto Rey",
      description:
        "Playa urbana en la urbanización Puerto Rey, con accesos para discapacitados, duchas, aseos y chiringuitos. Zona tranquila de casas bajas con instalaciones deportivas.",
      distance: "10 min en coche",
      rating: 4.0,
      badge: "Tranquila",
      image_url:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 3,
    },
    {
      id: "4",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Zona Naturista de El Playazo",
      description:
        "En la parte norte de El Playazo, mundialmente famosa por ser el primer enclave europeo oficialmente declarado para la práctica del nudismo. Cuenta con hoteles y restaurantes especializados.",
      distance: "15 min en coche",
      rating: 4.2,
      badge: "Naturista",
      image_url:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 4,
    },
  ],
  restaurants: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Restaurante Juan Moreno",
      description:
        "Uno de los mejores restaurantes de Vera, especializado en cocina mediterránea. Ideal para una cena especial con platos elaborados y un ambiente refinado.",
      rating: 4.6,
      review_count: 619,
      price_range: "€€€€",
      badge: "Gourmet",
      image_url:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 1,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Terraza Carmona",
      description:
        "Un clásico de Vera con terraza y comida exquisita. Especializados en cocina mediterránea y europea. Servicio atento y ambiente acogedor.",
      rating: 4.4,
      review_count: 911,
      price_range: "€€ - €€€",
      badge: "Clásico",
      image_url:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 2,
    },
    {
      id: "3",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Freiduria Bar Rosado",
      description:
        "Especializados en pescado frito y marisco fresco. Buena comida a precio razonable. Recomendamos probar las berenjenas a la miel y los boquerones.",
      rating: 4.4,
      review_count: 410,
      price_range: "€€ - €€€",
      badge: "Marisco",
      image_url:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 3,
    },
  ],
  activities: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "AquaVera Parque Acuático",
      description:
        "Parque acuático en la playa de Vera con atracciones para familias, niños y jóvenes. Toboganes, piscinas de olas y zonas de relax para disfrutar en familia.",
      distance: "10 min en coche",
      price_info: "Desde 14€",
      badge: "Familiar",
      image_url:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 1,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Club del Golf Valle del Este",
      description:
        "Campo de golf de 18 holes diseñado por José Canales. Cuenta con escuela de golf, restaurante y pro shop. Un desafío para jugadores de todos los niveles.",
      distance: "15 min en coche",
      price_info: "Precio green fee",
      badge: "Deporte",
      image_url:
        "https://images.unsplash.com/photo-1587105329505-6c6b7f5ed828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 2,
    },
    {
      id: "3",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Salar de los Canos",
      description:
        "Humedal que conforma uno de los ecosistemas más importantes de la provincia de Almería. Hábitat de garza real, flamencos, ánade real y otras especies.",
      distance: "20 min caminando",
      price_info: "Gratuito",
      badge: "Naturaleza",
      image_url:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      order_index: 3,
    },
  ],
  house_rules: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "No Fumar",
      description: "Por favor, no fumes dentro del apartamento. Puedes hacerlo en las zonas exteriores designadas.",
      icon: "fas fa-smoking-ban",
      order_index: 1,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Sin Fiestas",
      description:
        "No se permiten fiestas ni eventos ruidosos. Mantén un volumen moderado, especialmente por la noche.",
      icon: "fas fa-volume-mute",
      order_index: 2,
    },
    {
      id: "3",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Cuida como en Casa",
      description:
        "Trata el apartamento como si fuera tu hogar. Si encuentras algún problema, contáctanos de inmediato.",
      icon: "fas fa-home-heart",
      order_index: 3,
    },
    {
      id: "4",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Respeta el Descanso",
      description:
        "Por favor, mantén la tranquilidad entre las 8:00 am y las 12:00 pm para no molestar a otros residentes.",
      icon: "fas fa-bed",
      order_index: 4,
    },
  ],
  house_guide_items: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "TEMPERATURA",
      description:
        "Para una ventilación adecuada, abre las ventanas durante las horas frescas del día. El aire acondicionado está configurado para un consumo eficiente. Te recomendamos mantenerlo a 23°C para un confort óptimo.",
      details: "Cierra ventanas y puertas cuando uses el aire acondicionado para mayor eficiencia.",
      icon: "fas fa-temperature-high",
      order_index: 1,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "WIFI & TV",
      description:
        "Dispones de conexión WiFi gratuita de alta velocidad en todo el apartamento. El televisor es Smart TV con acceso a Netflix, YouTube y otras aplicaciones.",
      details: "Red: VeraTespera_WiFi | Contraseña: vera2024",
      icon: "fas fa-wifi",
      order_index: 2,
    },
  ],
  contact_info: {
    id: "1",
    guide_id: "550e8400-e29b-41d4-a716-446655440001",
    host_names: "Sonia y Pedro",
    phone: "+34 600 000 000",
    email: "info@veratespera.com",
    whatsapp: "+34 600 000 000",
    emergency_numbers: {
      emergencias: "112",
      policia_local: "092",
      guardia_civil: "062",
      bomberos: "080",
    },
    service_issues: [
      "Problemas con el aire acondicionado o calefacción",
      "Incidencias con el WiFi",
      "Falta de algún utensilio en la cocina",
      "Problemas con el agua caliente o electricidad",
      "Cualquier otra duda o incidencia",
    ],
  },
  practical_info: [
    {
      id: "1",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      category: "transport",
      title: "Transporte Público",
      description: "Información sobre autobuses y transporte en Vera",
      details: {
        lineas: ["Línea 1: Centro - Playa", "Línea 2: Estación - Puerto"],
        horarios: "06:00 - 23:00",
        precio: "1.50€",
      },
      icon: "fas fa-bus",
      order_index: 1,
    },
    {
      id: "2",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      category: "shopping",
      title: "Supermercados",
      description: "Lugares para hacer la compra cerca del apartamento",
      details: {
        mercadona: "5 min caminando",
        carrefour: "10 min en coche",
        dia: "3 min caminando",
      },
      icon: "fas fa-shopping-cart",
      order_index: 2,
    },
    {
      id: "3",
      guide_id: "550e8400-e29b-41d4-a716-446655440001",
      category: "health",
      title: "Centro de Salud",
      description: "Información médica y farmacia",
      details: {
        centro_salud: "Centro de Salud Vera - 5 min en coche",
        farmacia: "Farmacia Central - 2 min caminando",
        urgencias: "Hospital La Inmaculada - 15 min en coche",
      },
      icon: "fas fa-hospital",
      order_index: 3,
    },
  ],
}

export function useGuideData(propertyId: string) {
  // In a real app, this would fetch from Supabase based on propertyId
  // For now, return mock data
  return {
    data: mockGuideData,
    loading: false,
    error: null,
  }
}
