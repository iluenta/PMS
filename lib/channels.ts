import { supabase, isDemoMode } from "./supabase"
import type { 
  DistributionChannel, 
  PropertyChannel,
  PropertyChannelWithDetails,
  CreateChannelData, 
  UpdateChannelData,
  CreatePropertyChannelData,
  UpdatePropertyChannelData
} from "@/types/channels"

// Mock data for demo mode - Canales globales
const mockChannels: DistributionChannel[] = [
  {
    id: "1",
    name: "Booking.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/2560px-Airbnb_Logo_B%C3%A9lo.svg.png",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Expedia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Expedia_logo.svg/2560px-Expedia_logo.svg.png",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Canal Directo",
    logo: "https://via.placeholder.com/200x80/3B82F6/FFFFFF?text=Canal+Directo",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]

// Mock data for demo mode - Configuración por propiedad
const mockPropertyChannels: PropertyChannel[] = [
  {
    id: "1",
    property_id: "1",
    channel_id: "1",
    is_enabled: true,
    listing_url: "https://booking.com/property1",
    external_property_id: "booking-123",
    commission_override_charge: 15,
    commission_override_sale: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    sync_enabled: true,
    auto_update_ratings: false,
    property_rating: 0,
    property_review_count: 0,
    price_adjustment_percentage: 0,
    availability_sync_enabled: true,
    instant_booking_enabled: false,
  },
  {
    id: "2",
    property_id: "1",
    channel_id: "2",
    is_enabled: true,
    listing_url: "https://airbnb.com/property1",
    external_property_id: "airbnb-456",
    commission_override_charge: 12,
    commission_override_sale: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    sync_enabled: true,
    auto_update_ratings: false,
    property_rating: 0,
    property_review_count: 0,
    price_adjustment_percentage: 0,
    availability_sync_enabled: true,
    instant_booking_enabled: false,
  },
  {
    id: "3",
    property_id: "2",
    channel_id: "1",
    is_enabled: true,
    listing_url: "https://booking.com/property2",
    external_property_id: "booking-789",
    commission_override_charge: 18,
    commission_override_sale: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    sync_enabled: true,
    auto_update_ratings: false,
    property_rating: 0,
    property_review_count: 0,
    price_adjustment_percentage: 0,
    availability_sync_enabled: true,
    instant_booking_enabled: false,
  }
]

/**
 * Upload a logo to Supabase Storage and return the public URL
 */
async function uploadLogo(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage.from("channel-logos").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading logo:", uploadError)
    throw new Error("Error al subir el logo")
  }

  const { data } = supabase.storage.from("channel-logos").getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Delete a logo from Supabase Storage
 */
async function deleteLogo(logoUrl: string): Promise<void> {
  if (!logoUrl) return
  try {
    const fileName = logoUrl.split("/").pop()
    if (!fileName) return

    const { error } = await supabase.storage.from("channel-logos").remove([fileName])
    if (error) {
      console.error("Error deleting logo:", error)
      // Don't throw, just log the error, as the channel might be deleted anyway
    }
  } catch (error) {
    console.error("Error in deleteLogo:", error)
  }
}

/**
 * Get all distribution channels (globales)
 */
export async function getChannels(): Promise<DistributionChannel[]> {
  try {
    if (isDemoMode) {
      return mockChannels
    }

    const { data, error } = await supabase
      .from("distribution_channels")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching channels:", error)
      throw new Error("Error al cargar los canales")
    }

    return data || []
  } catch (error) {
    console.error("Error in getChannels:", error)
    throw error
  }
}

/**
 * Get a single channel by ID
 */
export async function getChannel(id: string): Promise<DistributionChannel | null> {
  try {
    if (isDemoMode) {
      return mockChannels.find(channel => channel.id === id) || null
    }

    const { data, error } = await supabase
      .from("distribution_channels")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching channel:", error)
      throw new Error("Error al cargar el canal")
    }

    return data
  } catch (error) {
    console.error("Error in getChannel:", error)
    throw error
  }
}

/**
 * Create a new channel
 */
export async function createChannel(channelData: CreateChannelData, logoFile?: File): Promise<DistributionChannel> {
  try {
    if (isDemoMode) {
      const newChannel: DistributionChannel = {
        id: Date.now().toString(),
        name: channelData.name,
        logo: logoFile ? URL.createObjectURL(logoFile) : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockChannels.push(newChannel)
      return newChannel
    }

    let logoUrl: string | undefined = undefined
    if (logoFile) {
      logoUrl = await uploadLogo(logoFile)
    }

    const { data, error } = await supabase
      .from("distribution_channels")
      .insert([{ ...channelData, logo: logoUrl }])
      .select()
      .single()

    if (error) {
      console.error("Error creating channel:", error)
      // If there's an error and we uploaded a logo, try to delete it
      if (logoUrl) await deleteLogo(logoUrl)
      throw new Error("Error al crear el canal")
    }

    return data
  } catch (error) {
    console.error("Error in createChannel:", error)
    throw error
  }
}

/**
 * Update a channel
 */
export async function updateChannel(id: string, channelData: UpdateChannelData, logoFile?: File, deleteExistingLogo = false): Promise<DistributionChannel> {
  try {
    if (isDemoMode) {
      const channelIndex = mockChannels.findIndex(channel => channel.id === id)
      if (channelIndex === -1) {
        throw new Error("Canal no encontrado")
      }
      mockChannels[channelIndex] = {
        ...mockChannels[channelIndex],
        ...channelData,
        logo: logoFile ? URL.createObjectURL(logoFile) : (deleteExistingLogo ? undefined : mockChannels[channelIndex].logo),
        updated_at: new Date().toISOString()
      }
      return mockChannels[channelIndex]
    }

    const { data: existingChannel, error: fetchError } = await supabase
      .from("distribution_channels")
      .select("logo")
      .eq("id", id)
      .single()

    if (fetchError || !existingChannel) {
      throw new Error("Canal no encontrado para actualizar")
    }

    let logoUrl = existingChannel.logo
    
    // Handle logo deletion
    if (deleteExistingLogo && existingChannel.logo) {
      await deleteLogo(existingChannel.logo)
      logoUrl = undefined
    }

    // Handle new logo upload
    if (logoFile) {
      if (existingChannel.logo && !deleteExistingLogo) {
        await deleteLogo(existingChannel.logo)
      }
      logoUrl = await uploadLogo(logoFile)
    }

    const { data, error } = await supabase
      .from("distribution_channels")
      .update({ ...channelData, logo: logoUrl })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating channel:", error)
      throw new Error("Error al actualizar el canal")
    }

    return data
  } catch (error) {
    console.error("Error in updateChannel:", error)
    throw error
  }
}

/**
 * Delete a channel
 */
export async function deleteChannel(id: string): Promise<void> {
  try {
    if (isDemoMode) {
      const channelIndex = mockChannels.findIndex(channel => channel.id === id)
      if (channelIndex === -1) {
        throw new Error("Canal no encontrado")
      }
      
      mockChannels.splice(channelIndex, 1)
      return
    }
    
    // First, get the logo URL to delete it from storage
    const { data: existingChannel, error: fetchError } = await supabase
      .from("distribution_channels")
      .select("logo")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching channel before delete:", fetchError)
      // Proceed with deletion anyway
    }

    if (existingChannel?.logo) {
      await deleteLogo(existingChannel.logo)
    }

    const { error } = await supabase
      .from("distribution_channels")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting channel:", error)
      throw new Error("Error al eliminar el canal")
    }
  } catch (error) {
    console.error("Error in deleteChannel:", error)
    throw error
  }
}

/**
 * Get property channels for a specific property
 */
export async function getPropertyChannels(propertyId: string): Promise<PropertyChannelWithDetails[]> {
  try {
    if (isDemoMode) {
      const propertyChannels = mockPropertyChannels.filter(pc => pc.property_id === propertyId)
      return propertyChannels.map(pc => ({
        ...pc,
        channel: mockChannels.find(c => c.id === pc.channel_id)
      }))
    }

    const { data, error } = await supabase
      .from("property_channels")
      .select(`
        *,
        channel:distribution_channels(*)
      `)
      .eq("property_id", propertyId)
      .order("created_at")

    if (error) {
      console.error("Error fetching property channels:", error)
      throw new Error("Error al cargar los canales de la propiedad")
    }

    return data || []
  } catch (error) {
    console.error("Error in getPropertyChannels:", error)
    throw error
  }
}

/**
 * Create property channel configuration
 */
export async function createPropertyChannel(channelData: CreatePropertyChannelData): Promise<PropertyChannel> {
  try {
    if (isDemoMode) {
      const newPropertyChannel: PropertyChannel = {
        id: Date.now().toString(),
        property_id: channelData.property_id,
        channel_id: channelData.channel_id,
        is_enabled: channelData.is_enabled || false,
        listing_url: channelData.listing_url || "",
        external_property_id: channelData.external_property_id || "",
        commission_override_charge: channelData.commission_override_charge || 0,
        commission_override_sale: channelData.commission_override_sale || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_enabled: channelData.sync_enabled || true,
        auto_update_ratings: channelData.auto_update_ratings || false,
        property_rating: 0,
        property_review_count: 0,
        price_adjustment_percentage: channelData.price_adjustment_percentage || 0,
        availability_sync_enabled: channelData.availability_sync_enabled || true,
        instant_booking_enabled: channelData.instant_booking_enabled || false,
      }
      mockPropertyChannels.push(newPropertyChannel)
      return newPropertyChannel
    }

    const { data, error } = await supabase
      .from("property_channels")
      .insert([channelData])
      .select()
      .single()

    if (error) {
      console.error("Error creating property channel:", error)
      throw new Error("Error al crear la configuración del canal")
    }

    return data
  } catch (error) {
    console.error("Error in createPropertyChannel:", error)
    throw error
  }
}

/**
 * Update property channel configuration
 */
export async function updatePropertyChannel(id: string, channelData: UpdatePropertyChannelData): Promise<PropertyChannel> {
  try {
    if (isDemoMode) {
      const channelIndex = mockPropertyChannels.findIndex(pc => pc.id === id)
      if (channelIndex > -1) {
        mockPropertyChannels[channelIndex] = {
          ...mockPropertyChannels[channelIndex],
          ...channelData,
          id: id,
          updated_at: new Date().toISOString()
        }
        return mockPropertyChannels[channelIndex]
      }
      throw new Error("Property channel not found")
    }

    const { data, error } = await supabase
      .from("property_channels")
      .update({
        ...channelData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating property channel:", error)
      throw new Error("Error al actualizar la configuración del canal")
    }

    return data
  } catch (error) {
    console.error("Error in updatePropertyChannel:", error)
    throw error
  }
}

/**
 * Delete property channel configuration
 */
export async function deletePropertyChannel(id: string): Promise<void> {
  try {
    if (isDemoMode) {
      const channelIndex = mockPropertyChannels.findIndex(pc => pc.id === id)
      if (channelIndex === -1) {
        throw new Error("Configuración de canal no encontrada")
      }
      
      mockPropertyChannels.splice(channelIndex, 1)
      return
    }

    const { error } = await supabase
      .from("property_channels")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting property channel:", error)
      throw new Error("Error al eliminar la configuración del canal")
    }
  } catch (error) {
    console.error("Error in deletePropertyChannel:", error)
    throw error
  }
}

/**
 * Toggle property channel enabled status
 */
export async function togglePropertyChannelStatus(id: string, isEnabled: boolean): Promise<PropertyChannel> {
  try {
    if (isDemoMode) {
      const channelIndex = mockPropertyChannels.findIndex(pc => pc.id === id)
      if (channelIndex === -1) {
        throw new Error("Configuración de canal no encontrada")
      }
      
      mockPropertyChannels[channelIndex].is_enabled = isEnabled
      mockPropertyChannels[channelIndex].updated_at = new Date().toISOString()
      return mockPropertyChannels[channelIndex]
    }

    const { data, error } = await supabase
      .from("property_channels")
      .update({
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error toggling property channel status:", error)
      throw new Error("Error al cambiar el estado del canal")
    }

    return data
  } catch (error) {
    console.error("Error in togglePropertyChannelStatus:", error)
    throw error
  }
}

/**
 * Get channel type based on name
 */
export function getChannelType(name: string): 'OTA' | 'Directo' | 'Otro' {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('booking') || lowerName.includes('airbnb') || 
      lowerName.includes('expedia') || lowerName.includes('hotels') ||
      lowerName.includes('tripadvisor') || lowerName.includes('vrbo')) {
    return 'OTA'
  }
  
  if (lowerName.includes('directo') || lowerName.includes('direct') || 
      lowerName.includes('propio') || lowerName.includes('web')) {
    return 'Directo'
  }
  
  return 'Otro'
} 