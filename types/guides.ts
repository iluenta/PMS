// Tipos para el sistema de guías del viajero
// Adaptados para TuriGest con multi-tenant

export interface Property {
  id: string
  name: string
  address?: string
  description?: string
  tenant_id: number
  created_at: string
  updated_at: string
}

export interface Guide {
  id: string
  tenant_id: number
  property_id: string
  title: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
  created_at: string
  updated_at: string
}

export interface GuideSection {
  id: string
  tenant_id: number
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title?: string
  content?: string
  icon?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApartmentSection {
  id: string
  tenant_id: number
  guide_id: string
  section_type: "cocina" | "bano" | "salon" | "dormitorio" | "terraza" | "entrada" | "balcon" | "garaje"
  title: string
  description?: string
  details?: string
  image_url?: string
  icon?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Beach {
  id: string
  tenant_id: number
  guide_id: string
  name: string
  description?: string
  distance?: string
  rating?: number
  badge?: string
  image_url?: string
  order_index: number
  created_at: string
  updated_at?: string
}

export interface Restaurant {
  id: string
  tenant_id: number
  guide_id: string
  name: string
  description?: string
  rating?: number
  review_count?: number
  price_range?: string
  badge?: string
  image_url?: string
  order_index: number
  created_at: string
  updated_at?: string
}

export interface Activity {
  id: string
  tenant_id: number
  guide_id: string
  name: string
  description?: string
  distance?: string
  price_info?: string
  badge?: string
  image_url?: string
  order_index: number
  created_at: string
  updated_at?: string
}

export interface HouseRule {
  id: string
  tenant_id: number
  guide_id: string
  title: string
  description?: string
  icon?: string
  order_index: number
  created_at: string
  updated_at?: string
}

export interface HouseGuideItem {
  id: string
  tenant_id: number
  guide_id: string
  title: string
  description?: string
  details?: string
  icon?: string
  order_index: number
  created_at: string
  updated_at?: string
}

export interface Tip {
  id: string
  tenant_id: number
  guide_id: string
  title: string
  description?: string
  details?: string
  icon?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface ContactInfo {
  id: string
  tenant_id: number
  guide_id: string
  host_names?: string
  phone?: string
  email?: string
  whatsapp?: string
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues?: string[]
  created_at: string
  updated_at: string
}

export interface PracticalInfo {
  id: string
  tenant_id: number
  guide_id: string
  category: string
  title: string
  description?: string
  details?: Record<string, any>
  icon?: string
  order_index: number
  created_at: string
}

// Tipo principal que agrupa todos los datos de una guía
export interface GuideData {
  property: {
    id: string
    name: string
    address?: string
    description?: string
  }
  guide: Guide
  sections: GuideSection[]
  apartment_sections: ApartmentSection[]
  beaches: Beach[]
  restaurants: Restaurant[]
  activities: Activity[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  tips: Tip[]
  contact_info: ContactInfo | null
  practical_info: PracticalInfo[]
}

// Tipos para operaciones CRUD
export interface CreateGuideData {
  property_id: string
  title?: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
}

export interface UpdateGuideData {
  title?: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
}

export interface CreateGuideSectionData {
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title?: string
  content?: string
  icon?: string
  order_index?: number
}

export interface UpdateGuideSectionData {
  section_type?: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title?: string
  content?: string
  icon?: string
  order_index?: number
  is_active?: boolean
}

export interface CreateBeachData {
  guide_id: string
  name: string
  description?: string
  distance?: string
  rating?: number
  badge?: string
  image_url?: string
  order_index?: number
}

export interface UpdateBeachData {
  name?: string
  description?: string
  distance?: string
  rating?: number
  badge?: string
  image_url?: string
  order_index?: number
}

export interface CreateRestaurantData {
  guide_id: string
  name: string
  description?: string
  rating?: number
  review_count?: number
  price_range?: string
  badge?: string
  image_url?: string
  order_index?: number
}

export interface UpdateRestaurantData {
  name?: string
  description?: string
  rating?: number
  review_count?: number
  price_range?: string
  badge?: string
  image_url?: string
  order_index?: number
}

export interface CreateActivityData {
  guide_id: string
  name: string
  description?: string
  distance?: string
  price_info?: string
  badge?: string
  image_url?: string
  order_index?: number
}

export interface UpdateActivityData {
  name?: string
  description?: string
  distance?: string
  price_info?: string
  badge?: string
  image_url?: string
  order_index?: number
}

export interface CreateApartmentSectionData {
  guide_id: string
  section_type: "cocina" | "bano" | "salon" | "dormitorio" | "terraza" | "entrada" | "balcon" | "garaje"
  title: string
  description?: string
  details?: string
  image_url?: string
  icon?: string
  order_index?: number
}

export interface UpdateApartmentSectionData {
  section_type?: "cocina" | "bano" | "salon" | "dormitorio" | "terraza" | "entrada" | "balcon" | "garaje"
  title?: string
  description?: string
  details?: string
  image_url?: string
  icon?: string
  order_index?: number
}

export interface CreateHouseRuleData {
  guide_id: string
  title: string
  description?: string
  icon?: string
  order_index?: number
}

export interface UpdateHouseRuleData {
  title?: string
  description?: string
  icon?: string
  order_index?: number
}

export interface CreateHouseGuideItemData {
  guide_id: string
  title: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

export interface UpdateHouseGuideItemData {
  title?: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

export interface CreateTipData {
  guide_id: string
  title: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

export interface UpdateTipData {
  title?: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

export interface CreateContactInfoData {
  guide_id: string
  host_names?: string
  phone?: string
  email?: string
  whatsapp?: string
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues?: string[]
}

export interface UpdateContactInfoData {
  host_names?: string
  phone?: string
  email?: string
  whatsapp?: string
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues?: string[]
}

export interface CreatePracticalInfoData {
  guide_id: string
  category: string
  title: string
  description?: string
  details?: Record<string, any>
  icon?: string
  order_index?: number
}

export interface UpdatePracticalInfoData {
  category?: string
  title?: string
  description?: string
  details?: Record<string, any>
  icon?: string
  order_index?: number
}
