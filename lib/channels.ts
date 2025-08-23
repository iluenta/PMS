import { supabase } from "./supabase"
import type { 
  DistributionChannel, 
  PropertyChannel,
  PropertyChannelWithDetails,
  CreateChannelData, 
  UpdateChannelData,
  CreatePropertyChannelData,
  UpdatePropertyChannelData
} from "@/types/channels"

// demo data removed

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
 * Get property channels for a specific property (all channels for management)
 */
export async function getPropertyChannels(propertyId: string): Promise<PropertyChannelWithDetails[]> {
  try {

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
 * Get only active property channels for a specific property (for forms and active operations)
 */
export async function getActivePropertyChannels(propertyId: string): Promise<PropertyChannelWithDetails[]> {
  try {

    const { data, error } = await supabase
      .from("property_channels")
      .select(`
        *,
        channel:distribution_channels(*)
      `)
      .eq("property_id", propertyId)
      .eq("is_enabled", true) // Solo canales activos
      .order("created_at")

    if (error) {
      console.error("Error fetching active property channels:", error)
      throw new Error("Error al cargar los canales activos de la propiedad")
    }

    return data || []
  } catch (error) {
    console.error("Error in getActivePropertyChannels:", error)
    throw error
  }
}

/**
 * Create property channel configuration
 */
export async function createPropertyChannel(channelData: CreatePropertyChannelData): Promise<PropertyChannel> {
  try {

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