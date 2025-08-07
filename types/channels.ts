// Tipos para canales de distribución globales
export interface DistributionChannel {
  id: string
  name: string
  logo?: string
  created_at: string
  updated_at: string
}

// Tipos para configuración de canal por propiedad
export interface PropertyChannel {
  id: string
  property_id: string
  channel_id: string
  is_enabled: boolean
  sync_enabled: boolean
  auto_update_ratings: boolean
  external_property_id?: string
  external_listing_id?: string
  external_place_id?: string
  listing_url?: string
  review_url?: string
  property_rating?: number
  property_review_count?: number
  last_rating_update?: string
  price_adjustment_percentage: number
  commission_override_charge?: number
  commission_override_sale?: number
  availability_sync_enabled: boolean
  instant_booking_enabled: boolean
  created_at: string
  updated_at: string
}

// DTOs para operaciones CRUD
export interface CreateChannelData {
  name: string
  logo?: string
}

export interface UpdateChannelData {
  name?: string
  logo?: string
}

export interface CreatePropertyChannelData {
  property_id: string
  channel_id: string
  is_enabled?: boolean
  sync_enabled?: boolean
  auto_update_ratings?: boolean
  external_property_id?: string
  external_listing_id?: string
  external_place_id?: string
  listing_url?: string
  review_url?: string
  price_adjustment_percentage?: number
  commission_override_charge?: number
  commission_override_sale?: number
  availability_sync_enabled?: boolean
  instant_booking_enabled?: boolean
}

export interface UpdatePropertyChannelData {
  is_enabled?: boolean
  sync_enabled?: boolean
  auto_update_ratings?: boolean
  external_property_id?: string
  external_listing_id?: string
  external_place_id?: string
  listing_url?: string
  review_url?: string
  price_adjustment_percentage?: number
  commission_override_charge?: number
  commission_override_sale?: number
  availability_sync_enabled?: boolean
  instant_booking_enabled?: boolean
}

// Tipo para mostrar canales con información de la propiedad
export interface PropertyChannelWithDetails extends PropertyChannel {
  channel?: DistributionChannel
} 