// Utility functions for generating realistic sample data

export const spanishCities = [
  { name: "Vera", province: "Almería", region: "Andalucía" },
  { name: "Mojácar", province: "Almería", region: "Andalucía" },
  { name: "Garrucha", province: "Almería", region: "Andalucía" },
  { name: "Carboneras", province: "Almería", region: "Andalucía" },
  { name: "Águilas", province: "Murcia", region: "Murcia" },
  { name: "Mazarrón", province: "Murcia", region: "Murcia" },
  { name: "Torrevieja", province: "Alicante", region: "Valencia" },
  { name: "Guardamar", province: "Alicante", region: "Valencia" },
  { name: "Denia", province: "Alicante", region: "Valencia" },
  { name: "Calpe", province: "Alicante", region: "Valencia" },
]

export const propertyTypes = [
  "Apartamento",
  "Villa",
  "Casa Rural",
  "Chalet",
  "Estudio",
  "Ático",
  "Casa Adosada",
  "Finca",
]

export const propertyNames = [
  "VeraTespera",
  "Casa del Mar",
  "Villa Mediterránea",
  "Apartamento Playa Azul",
  "Chalet Los Pinos",
  "Estudio Marisol",
  "Villa Esperanza",
  "Casa Blanca",
  "Apartamento Brisa Marina",
  "Chalet Vista Mar",
  "Villa Palmeras",
  "Casa de los Vientos",
]

export const beachTypes = [
  { name: "Playa de", badges: ["Familiar", "Tranquila", "Recomendada"] },
  { name: "Cala", badges: ["Escondida", "Virgen", "Naturista"] },
  { name: "El Playazo de", badges: ["Extensa", "Deportiva", "Ventosa"] },
  { name: "Puerto de", badges: ["Urbana", "Comercial", "Animada"] },
]

export const beachNames = [
  "Las Marinas",
  "Bolaga",
  "Puerto Rey",
  "Quitapellejos",
  "Los Cocedores",
  "El Playazo",
  "Las Palmeras",
  "Cala Cristal",
  "El Rincón",
  "La Esperanza",
]

export const restaurantTypes = [
  { type: "Gourmet", priceRange: "€€€€", cuisine: "Mediterránea" },
  { type: "Clásico", priceRange: "€€ - €€€", cuisine: "Española" },
  { type: "Marisco", priceRange: "€€ - €€€", cuisine: "Mariscos" },
  { type: "Internacional", priceRange: "€€ - €€€", cuisine: "Internacional" },
  { type: "Fritura", priceRange: "€€", cuisine: "Fritura Andaluza" },
  { type: "Tapas", priceRange: "€ - €€", cuisine: "Tapas" },
  { type: "Pizzería", priceRange: "€€", cuisine: "Italiana" },
  { type: "Chiringuito", priceRange: "€€", cuisine: "Playa" },
]

export const restaurantNames = [
  "Juan Moreno",
  "Terraza Carmona",
  "Bar Rosado",
  "El Cenachero",
  "La Marina",
  "Casa Pepe",
  "El Rincón del Pescador",
  "Marisquería Bahía",
  "Restaurante Mediterráneo",
  "La Taberna del Puerto",
]

export const activityTypes = [
  { type: "Familiar", activities: ["Parque Acuático", "Zoo", "Parque Temático", "Playa Familiar"] },
  { type: "Deporte", activities: ["Golf", "Tenis", "Paddle", "Deportes Acuáticos"] },
  { type: "Naturaleza", activities: ["Senderismo", "Observación de Aves", "Parque Natural", "Reserva Marina"] },
  { type: "Cultural", activities: ["Museo", "Castillo", "Iglesia", "Centro Histórico"] },
  { type: "Aventura", activities: ["Escalada", "Buceo", "Kayak", "Parapente"] },
]

export function generateRandomProperty(index: number) {
  const city = spanishCities[Math.floor(Math.random() * spanishCities.length)]
  const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
  const baseName = propertyNames[Math.floor(Math.random() * propertyNames.length)]

  return {
    id: `550e8400-e29b-41d4-a716-44665544${String(index).padStart(4, "0")}`,
    name: `${baseName} ${index > 0 ? index + 1 : ""}`.trim(),
    address: `Calle ${["del Mar", "de la Playa", "Principal", "Mayor", "de los Pinos"][Math.floor(Math.random() * 5)]}, ${
      Math.floor(Math.random() * 200) + 1
    }, ${city.name}, ${city.province}`,
    description: `${propertyType} en ${city.name}, ${city.province}. ${
      [
        "Perfecto para vacaciones en familia",
        "Con vistas espectaculares al mar",
        "En el corazón del casco histórico",
        "A pocos metros de la playa",
        "Con todas las comodidades modernas",
        "Ideal para parejas y familias",
        "En zona tranquila y residencial",
      ][Math.floor(Math.random() * 7)]
    }.`,
    created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    has_guide: Math.random() > 0.3, // 70% chance of having a guide
  }
}

export function generateRandomBeach(guideId: string, index: number) {
  const beachType = beachTypes[Math.floor(Math.random() * beachTypes.length)]
  const beachName = beachNames[Math.floor(Math.random() * beachNames.length)]
  const badge = beachType.badges[Math.floor(Math.random() * beachType.badges.length)]

  const distances = ["5 min caminando", "10 min caminando", "15 min caminando", "5 min en coche", "10 min en coche"]
  const descriptions = [
    "Playa de arena fina y dorada con aguas cristalinas",
    "Cala protegida ideal para familias con niños",
    "Extensa playa con todos los servicios y chiringuitos",
    "Playa virgen rodeada de naturaleza",
    "Zona de playa con deportes acuáticos y actividades",
  ]

  return {
    id: `beach-${index}`,
    guide_id: guideId,
    name: `${beachType.name} ${beachName}`,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    distance: distances[Math.floor(Math.random() * distances.length)],
    rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // Between 3.5 and 5.0
    badge,
    image_url: `https://images.unsplash.com/photo-${
      [
        "1505228395891-9a51e7e86bf6",
        "1582719478250-c89cae4dc85b",
        "1506905925346-21bda4d32df4",
        "1544551763-46a013bb70d5",
        "1533563996068-24833183f0b4",
      ][Math.floor(Math.random() * 5)]
    }?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`,
    order_index: index + 1,
  }
}

export function generateRandomRestaurant(guideId: string, index: number) {
  const restaurantType = restaurantTypes[Math.floor(Math.random() * restaurantTypes.length)]
  const restaurantName = restaurantNames[Math.floor(Math.random() * restaurantNames.length)]

  const descriptions = [
    `Especializado en ${restaurantType.cuisine.toLowerCase()}. Ambiente acogedor y servicio excelente.`,
    `Restaurante familiar con tradición en ${restaurantType.cuisine.toLowerCase()}. Productos frescos y locales.`,
    `Cocina ${restaurantType.cuisine.toLowerCase()} con toques modernos. Ideal para cenas especiales.`,
    `Local tradicional conocido por su ${restaurantType.cuisine.toLowerCase()}. Buena relación calidad-precio.`,
  ]

  return {
    id: `restaurant-${index}`,
    guide_id: guideId,
    name: `Restaurante ${restaurantName}`,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
    review_count: Math.floor(Math.random() * 800) + 100,
    price_range: restaurantType.priceRange,
    badge: restaurantType.type,
    image_url: `https://images.unsplash.com/photo-${
      [
        "1414235077428-338989a2e8c0",
        "1555396273-367ea4eb4db5",
        "1568901346375-23c9450c58cd",
        "1526318896980-cf78c088247c",
        "1555939594-58d7cb561ad1",
      ][Math.floor(Math.random() * 5)]
    }?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`,
    order_index: index + 1,
  }
}

export function generateRandomActivity(guideId: string, index: number) {
  const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
  const activityName = activityType.activities[Math.floor(Math.random() * activityType.activities.length)]

  const distances = ["5 min en coche", "10 min en coche", "15 min en coche", "20 min en coche", "30 min en coche"]
  const prices = ["Gratuito", "Desde 5€", "Desde 10€", "Desde 15€", "Desde 20€", "Consultar precios"]

  const descriptions = [
    `${activityName} perfecto para toda la familia. Una experiencia única en la zona.`,
    `Disfruta de ${activityName.toLowerCase()} en un entorno privilegiado. Actividad muy recomendada.`,
    `${activityName} con instalaciones modernas y personal cualificado. Ideal para ${activityType.type.toLowerCase()}.`,
    `Una de las mejores opciones de ${activityName.toLowerCase()} de la región. No te lo pierdas.`,
  ]

  return {
    id: `activity-${index}`,
    guide_id: guideId,
    name: activityName,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    distance: distances[Math.floor(Math.random() * distances.length)],
    price_info: prices[Math.floor(Math.random() * prices.length)],
    badge: activityType.type,
    image_url: `https://images.unsplash.com/photo-${
      [
        "1578662996442-48f60103fc96",
        "1587105329505-6c6b7f5ed828",
        "1506905925346-21bda4d32df4",
        "1551632811-561732d1e306",
        "1544735716-392fe2489ffa",
      ][Math.floor(Math.random() * 5)]
    }?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`,
    order_index: index + 1,
  }
}

export function generateHouseRules(guideId: string) {
  const rules = [
    {
      title: "No Fumar",
      description: "Por favor, no fumes dentro del apartamento. Puedes hacerlo en las zonas exteriores designadas.",
      icon: "fas fa-smoking-ban",
    },
    {
      title: "Sin Fiestas",
      description:
        "No se permiten fiestas ni eventos ruidosos. Mantén un volumen moderado, especialmente por la noche.",
      icon: "fas fa-volume-mute",
    },
    {
      title: "Cuida como en Casa",
      description:
        "Trata el apartamento como si fuera tu hogar. Si encuentras algún problema, contáctanos de inmediato.",
      icon: "fas fa-home-heart",
    },
    {
      title: "Respeta el Descanso",
      description: "Por favor, mantén la tranquilidad entre las 22:00 y las 8:00 para no molestar a otros residentes.",
      icon: "fas fa-bed",
    },
    {
      title: "Mascotas",
      description: "Las mascotas son bienvenidas. Por favor, limpia después de ellas y mantenlas controladas.",
      icon: "fas fa-paw",
    },
    {
      title: "Check-in/Check-out",
      description: "Check-in: 16:00 - 20:00. Check-out: antes de las 11:00. Contacta para horarios especiales.",
      icon: "fas fa-clock",
    },
  ]

  return rules.slice(0, Math.floor(Math.random() * 3) + 3).map((rule, index) => ({
    id: `rule-${index}`,
    guide_id: guideId,
    ...rule,
    order_index: index + 1,
  }))
}

export function generateHouseGuideItems(guideId: string) {
  const items = [
    {
      title: "TEMPERATURA",
      description:
        "Para una ventilación adecuada, abre las ventanas durante las horas frescas del día. El aire acondicionado está configurado para un consumo eficiente.",
      details: "Cierra ventanas y puertas cuando uses el aire acondicionado para mayor eficiencia.",
      icon: "fas fa-temperature-high",
    },
    {
      title: "WIFI & TV",
      description:
        "Dispones de conexión WiFi gratuita de alta velocidad en todo el apartamento. El televisor es Smart TV con acceso a Netflix, YouTube y otras aplicaciones.",
      details: "Red: Casa_WiFi | Contraseña: casa2024",
      icon: "fas fa-wifi",
    },
    {
      title: "COCINA",
      description:
        "La cocina está completamente equipada con todos los electrodomésticos y utensilios necesarios. Incluye lavavajillas, microondas, nevera y vitrocerámica.",
      details: "Encontrarás productos básicos como sal, aceite y especias en los armarios.",
      icon: "fas fa-utensils",
    },
    {
      title: "LAVANDERÍA",
      description: "Lavadora disponible en el baño. Detergente incluido. Tendedero en la terraza para secar la ropa.",
      details: "Programa recomendado: 30°C para ropa normal, 40°C para ropa muy sucia.",
      icon: "fas fa-tshirt",
    },
    {
      title: "PARKING",
      description: "Plaza de parking privada incluida en el garaje subterráneo. Acceso con mando a distancia.",
      details: "El mando está en la mesa de entrada. Plaza número marcada con el número del apartamento.",
      icon: "fas fa-car",
    },
  ]

  return items.slice(0, Math.floor(Math.random() * 2) + 3).map((item, index) => ({
    id: `house-item-${index}`,
    guide_id: guideId,
    ...item,
    order_index: index + 1,
  }))
}
