export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  tenant_id: string
  name: string
  address: string
  description: string
}

export interface Guide {
  id: string
  tenant_id: string
  property_id: string
  title: string
  welcome_message: string
  host_names: string
  host_signature: string
}

export interface GuideSection {
  id: string
  tenant_id: string
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title: string
  content: string
  order_index: number
  is_active: boolean
}

export interface Beach {
  id: string
  tenant_id: string
  guide_id: string
  name: string
  description: string
  distance: string
  rating: number
  badge: string
  image_url: string
  order_index: number
}

export interface Restaurant {
  id: string
  tenant_id: string
  guide_id: string
  name: string
  description: string
  rating: number
  review_count: number
  price_range: string
  badge: string
  image_url: string
  order_index: number
}

export interface Activity {
  id: string
  tenant_id: string
  guide_id: string
  name: string
  description: string
  distance: string
  price_info: string
  badge: string
  image_url: string
  order_index: number
}

export interface HouseRule {
  id: string
  tenant_id: string
  guide_id: string
  title: string
  description: string
  icon: string
  order_index: number
}

export interface HouseGuideItem {
  id: string
  tenant_id: string
  guide_id: string
  title: string
  description: string
  details: string
  icon: string
  order_index: number
}

export interface ContactInfo {
  id: string
  tenant_id: string
  guide_id: string
  host_names: string
  phone: string
  email: string
  whatsapp: string
  emergency_numbers: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues: string[]
}

export interface PracticalInfo {
  id: string
  tenant_id: string
  guide_id: string
  category: string
  title: string
  description: string
  details: Record<string, any>
  icon: string
  order_index: number
}

export interface GuideData {
  tenant: Tenant
  property: Property
  guide: Guide
  sections: GuideSection[]
  beaches: Beach[]
  restaurants: Restaurant[]
  activities: Activity[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  contact_info: ContactInfo
  practical_info: PracticalInfo[]
}

export interface TenantContext {
  tenant: Tenant | null
  setTenant: (tenant: Tenant | null) => void
  isLoading: boolean
}

export interface CreateTenantRequest {
  name: string
  slug: string
  domain?: string
  settings?: Record<string, any>
}

export interface UpdateTenantRequest {
  name?: string
  slug?: string
  domain?: string
  settings?: Record<string, any>
  is_active?: boolean
}
