// Node.js script to generate comprehensive sample data
import {
  generateRandomProperty,
  generateRandomBeach,
  generateRandomRestaurant,
  generateRandomActivity,
  generateHouseRules,
  generateHouseGuideItems,
} from "../lib/sample-data-generator"

interface GeneratedGuideData {
  property: any
  guide: any
  beaches: any[]
  restaurants: any[]
  activities: any[]
  house_rules: any[]
  house_guide_items: any[]
  contact_info: any
}

function generateCompleteGuideData(propertyIndex: number): GeneratedGuideData {
  const property = generateRandomProperty(propertyIndex)
  const guideId = `guide-${property.id}`

  const guide = {
    id: guideId,
    property_id: property.id,
    title: `Guía de ${property.name}`,
    welcome_message: `¡Bienvenidos a ${property.name}! Esperamos que disfruten de su estancia. Hemos preparado esta guía con toda la información necesaria para que tengan unas vacaciones perfectas en nuestra propiedad.`,
    host_names: ["Ana y Luis", "María y Carlos", "Laura y Javier", "Sonia y Pedro", "Carmen y Miguel"][
      Math.floor(Math.random() * 5)
    ],
    host_signature: "Con cariño, sus anfitriones",
  }

  // Generate 3-5 beaches
  const beachCount = Math.floor(Math.random() * 3) + 3
  const beaches = Array.from({ length: beachCount }, (_, i) => generateRandomBeach(guideId, i))

  // Generate 3-6 restaurants
  const restaurantCount = Math.floor(Math.random() * 4) + 3
  const restaurants = Array.from({ length: restaurantCount }, (_, i) => generateRandomRestaurant(guideId, i))

  // Generate 2-5 activities
  const activityCount = Math.floor(Math.random() * 4) + 2
  const activities = Array.from({ length: activityCount }, (_, i) => generateRandomActivity(guideId, i))

  // Generate house rules and guide items
  const house_rules = generateHouseRules(guideId)
  const house_guide_items = generateHouseGuideItems(guideId)

  // Generate contact info
  const contact_info = {
    id: `contact-${guideId}`,
    guide_id: guideId,
    host_names: guide.host_names,
    phone: `+34 6${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${
      Math.floor(Math.random() * 900) + 100
    }`,
    email: `info@${property.name.toLowerCase().replace(/\s+/g, "")}.com`,
    whatsapp: `+34 6${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${
      Math.floor(Math.random() * 900) + 100
    }`,
    emergency_numbers: {
      emergencias: "112",
      policia_local: "092",
      guardia_civil: "062",
      bomberos: "080",
    },
    service_issues: [
      "Problemas con el aire acondicionado o calefacción",
      "Incidencias con el WiFi",
      "Averías en electrodomésticos",
      "Problemas con el agua caliente",
      "Cualquier otra consulta",
    ],
  }

  return {
    property,
    guide,
    beaches,
    restaurants,
    activities,
    house_rules,
    house_guide_items,
    contact_info,
  }
}

// Generate multiple properties
function generateMultipleProperties(count: number): GeneratedGuideData[] {
  return Array.from({ length: count }, (_, i) => generateCompleteGuideData(i))
}

// Export functions for use in other scripts
export { generateCompleteGuideData, generateMultipleProperties }

// If running directly, generate and log sample data
if (require.main === module) {
  console.log("Generating sample data...")

  const sampleData = generateMultipleProperties(5)

  console.log("Generated data for", sampleData.length, "properties:")
  sampleData.forEach((data, index) => {
    console.log(`\n${index + 1}. ${data.property.name}`)
    console.log(`   - ${data.beaches.length} beaches`)
    console.log(`   - ${data.restaurants.length} restaurants`)
    console.log(`   - ${data.activities.length} activities`)
    console.log(`   - ${data.house_rules.length} house rules`)
    console.log(`   - ${data.house_guide_items.length} guide items`)
  })

  // Output SQL for easy database insertion
  console.log("\n--- SQL INSERT STATEMENTS ---")
  sampleData.forEach((data) => {
    console.log(`\n-- Property: ${data.property.name}`)
    console.log(
      `INSERT INTO properties (id, name, address, description) VALUES ('${data.property.id}', '${data.property.name}', '${data.property.address}', '${data.property.description}');`,
    )
    console.log(
      `INSERT INTO guides (id, property_id, title, welcome_message, host_names, host_signature) VALUES ('${data.guide.id}', '${data.guide.property_id}', '${data.guide.title}', '${data.guide.welcome_message}', '${data.guide.host_names}', '${data.guide.host_signature}');`,
    )
  })
}
