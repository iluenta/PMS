import { createClient, SupabaseClient } from "@supabase/supabase-js"
import {
  supabase,
  type Booking,
  type Property,
  type Guest,
  type Reservation,
  getChannelCommissions,
  calculateBookingCommissions,
  calculateBookingFinancials,
  getPropertyChannels
} from "@/lib/supabase"

// No demo data in production repository

// ============================================================================
// Connection Health Management
// ============================================================================

let lastConnectionCheck = 0
const CONNECTION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Check if the Supabase connection is healthy
 */
async function checkConnectionHealth(supabaseClient: SupabaseClient): Promise<boolean> {
  // Don't check too frequently
  if (Date.now() - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return true
  }

 

  try {
    lastConnectionCheck = Date.now()
    console.log('🔍 Checking Supabase connection health...')
    
    // Use a simple query to test connection with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), 5000) // 5 second timeout
    })
    
    const healthCheckPromise = supabaseClient
      .from('users')
      .select('id')
      .limit(1)
    
    // Race between health check and timeout
    const { error } = await Promise.race([healthCheckPromise, timeoutPromise])
    
    if (error) {
      // Log error without exposing sensitive details
      console.warn('Connection health check failed')
      return false
    }
    
    return true
  } catch (error) {
    // Handle network errors silently to avoid exposing system details
    return false
  }
}

/**
 * Get a healthy Supabase client, reinitializing if necessary
 */
async function getHealthySupabaseClient(): Promise<SupabaseClient> {
  if (!supabase) {
    return getSupabaseClient()
  }

  try {
    const isHealthy = await checkConnectionHealth(supabase)
    if (!isHealthy) {
      supabase = null
      return getSupabaseClient()
    }

    return supabase
  } catch (error) {
    // If health check fails completely, reinitialize as fallback
    supabase = null
    return getSupabaseClient()
  }
}

// ============================================================================
// Supabase Client Initialization (Singleton Pattern)
// ============================================================================

let supabase: SupabaseClient | null = null

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase URL or Anon Key is missing. Auth will likely fail.")
      // Create a dummy client to prevent undefined errors
      supabase = createClient("https://dummy.supabase.co", "dummy-key", {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    } else {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        // Configuración adicional para manejar problemas de certificados SSL
        global: {
          headers: {
            'User-Agent': 'TuriGest/1.0'
          },
          // Configuración para entornos corporativos con problemas de SSL
          ...(typeof window === 'undefined' && {
            // Solo en el servidor, configurar para manejar certificados problemáticos
            rejectUnauthorized: false,
            // Timeout más largo para entornos corporativos
            timeout: 30000,
          })
        }
      })
    }
  }
  return supabase
}

// Initialize the client
const supabaseClient = getSupabaseClient()

// ============================================================================
// Heartbeat to keep connection alive
// ============================================================================

// Only run heartbeat on the server side
// TEMPORARILY DISABLED - causing connection issues
// if (typeof window === 'undefined') {
//   setInterval(async () => {
//     try {
//       await checkConnectionHealth(supabaseClient)
//     } catch (error) {
//       // Silent heartbeat check to avoid exposing system details
//     }
//   }, 10 * 60 * 1000) // Every 10 minutes (less aggressive)
// }

// ============================================================================
// Export function to get healthy client
// ============================================================================

/**
 * Get a healthy Supabase client for database operations
 * This function ensures the connection is healthy before returning the client
 */
export async function getSupabase(): Promise<SupabaseClient> {
  return await getHealthySupabaseClient()
}

// ============================================================================
// No demo mode

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "manager" | "operator" | "viewer"
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Property {
  id: string
  tenant_id: number
  name: string
  description?: string
  type: string
  address: string
  city: string
  postal_code?: string
  country: string
  bedrooms: number
  bathrooms: number
  capacity: number
  max_guests: number
  area: number
  base_price: number
  cleaning_fee: number
  security_deposit: number
  check_in_time: string
  check_out_time: string
  min_stay: number
  max_stay: number
  is_active: boolean
  images: string[]
  cover_image?: string
  amenities: string[]
  status: string
  channel_ratings?: any
  channel_configuration?: any
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  country: string
  date_of_birth?: string
  id_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  property_id: string
  guest_id: string
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number
  commission_rate?: number
  commission_amount?: number
  channel_commission?: number
  collection_commission?: number
  total_commission?: number
  net_amount?: number
  status: string
  payment_status?: string
  booking_source: string
  special_requests?: string
  notes?: string
  created_at: string
  updated_at: string
  property?: Property
  guest?: Guest
}

export interface DistributionChannel {
  id: string
  name: string
  created_at: string
  updated_at: string
  logo?: string
}

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
  channel?: DistributionChannel
}

export interface Reservation {
  id: string
  guest: {
    name?: string
    email?: string
    phone?: string
    [key: string]: any
  }
  property_id: string
  check_in: string
  check_out: string
  nights: number
  guests: number
  adults: number
  children: number
  status: string
  payment_status: string
  total_amount: number
  base_amount: number
  cleaning_fee: number
  taxes: number
  channel?: string
  notes?: string
  special_requests?: string
  external_id?: string
  external_source?: string
  ical_uid?: string
  channel_commission: number
  collection_commission: number
  property_channel_id: string
  created_at: string
  updated_at: string
  property?: Property
  property_channel?: PropertyChannel
}

export interface CommissionSetting {
  id: string
  owner_id: string
  channel_name: string
  channel_type: string
  commission_rate: number
  commission_type: string
  fixed_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookingPayment {
  id: string
  booking_id: string
  payment_type: string
  amount: number
  commission_amount: number
  net_amount: number
  payment_method: string
  payment_status: string
  payment_date?: string
  reference_number?: string
  notes?: string
  created_at: string
  updated_at: string
  booking?: Booking
}

export interface PropertyExpense {
  id: string
  property_id: string
  booking_id?: string
  expense_type: string
  category: string
  description: string
  amount: number
  expense_date: string
  payment_method?: string
  receipt_url?: string
  vendor_name?: string
  is_recurring: boolean
  recurring_frequency?: string
  status: string
  created_at: string
  updated_at: string
  property?: Property
  booking?: Booking
}

export interface Expense {
  id: string
  tenant_id: number
  category?: string
  subcategory?: string
  description: string
  amount: number
  vendor?: string
  vendor_id?: string
  date: string
  status: string
  payment_method?: string
  reference?: string
  notes?: string
  receipt_url?: string
  property_id?: string
  is_recurring?: boolean
  next_due_date?: string
  created_at: string
  updated_at: string
  reservation_id?: string
  category_id?: string
  subcategory_id?: string
  property?: Property
  reservation?: Reservation
}

export interface AvailabilitySetting {
  id: string
  property_id: string
  min_nights: number
  max_nights: number
  advance_booking_days: number
  max_advance_booking_days: number
  check_in_days: string[]
  check_out_days: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  property_id: string
  name: string
  start_date: string
  end_date: string
  price_per_night: number
  minimum_stay: number
  rule_type: string
  created_at: string
}

export interface Channel {
  id: string
  name: string
  type: string
  api_key?: string
  is_active: boolean
  commission_rate: number
  created_at: string
}

export interface Payment {
  id: string
  invoice_id?: string
  invoice_number?: string
  customer_name: string
  amount: number
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'check' | 'bizum'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  date: string
  reference?: string
  notes?: string
  fee?: number
  created_at: string
  updated_at: string
  reservation_id?: string
  reservation?: Reservation
  invoice?: Invoice
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  status: string
  issue_date: string
  due_date?: string
  created_at: string
  updated_at: string
}

// demo datasets removed

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clears expired tokens by signing out the user.
 * This is a workaround for potential token refresh issues.
 */
export async function clearExpiredTokens() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut()

  }
}

/**
 * Versión con IVA configurable por canal.
 */
export function calculateRequiredAmountWithVat(
  reservation: Reservation,
  vatPercent: number,
  applyVat: boolean
): number {
  const totalAmount = reservation.total_amount || 0
  const channelCommission = reservation.channel_commission || 0
  const collectionCommission = reservation.collection_commission || 0
  const totalCommissions = channelCommission + collectionCommission

  const vatFactor = applyVat ? (1 + (Number(vatPercent) || 0) / 100) : 1
  const totalCommissionsWithVAT = totalCommissions * vatFactor
  const result = totalAmount - totalCommissionsWithVAT
  const rounded = Math.round(result * 100) / 100
  return Math.max(0, rounded)
}

export function calculateReservationAmountsWithVat(
  reservation: Reservation,
  vatPercent: number,
  applyVat: boolean
) {
  const totalAmount = reservation.total_amount || 0
  const channelCommission = reservation.channel_commission || 0
  const collectionCommission = reservation.collection_commission || 0
  const totalCommissions = channelCommission + collectionCommission
  const commissionIVA = totalCommissions * ((applyVat ? (Number(vatPercent) || 0) : 0) / 100)
  const finalAmount = calculateRequiredAmountWithVat(reservation, vatPercent, applyVat)

  return {
    totalAmount,
    channelCommission,
    collectionCommission,
    totalCommissions,
    commissionIVA,
    finalAmount: Math.max(0, Math.round(finalAmount * 100) / 100)
  }
}

/**
 * Get commission rates for a specific property and channel
 */
export async function getChannelCommissions(propertyId: string, channelName: string) {
  try {


    // First, get the channel ID from distribution_channels
    const { data: channels, error: channelError } = await supabaseClient
      .from("distribution_channels")
      .select("id")
      .eq("name", channelName)

    console.log("📊 Channel data:", channels)
    console.log("❌ Channel error:", channelError)

    if (!channels || channelError || channels.length === 0) {
      console.log("⚠️ Channel not found, using default commission rates")
      // Return default commission rates based on channel name
      const defaultCommissionRates: Record<string, { charge: number; sale: number }> = {
        "Booking.com": { charge: 3.0, sale: 15.0 },
        "Airbnb": { charge: 3.0, sale: 12.0 },
        "Expedia": { charge: 4.0, sale: 18.0 },
        "VRBO": { charge: 3.0, sale: 15.0 },
        "Direct": { charge: 0.0, sale: 0.0 },
      }
      return defaultCommissionRates[channelName] || { charge: 0.0, sale: 0.0 }
    }

    const channel = channels[0] // Take the first match

    // Then get the commission rates from property_channels
    const { data: propertyChannel, error: propertyChannelError } = await supabaseClient
      .from("property_channels")
      .select("commission_charge_percentage, commission_sale_percentage")
      .eq("property_id", propertyId)
      .eq("channel_id", channel.id)

    console.log("📊 Property channel commission data:", propertyChannel)
    console.log("❌ Property channel commission error:", propertyChannelError)

    if (propertyChannel && propertyChannel.length > 0) {
      const commissionData = propertyChannel[0]
      return {
        charge: commissionData.commission_charge_percentage || 0.0,
        sale: commissionData.commission_sale_percentage || 0.0,
      }
    }

    // Return default rates if no property-specific rates found
    console.log("⚠️ Property-specific commission rates not found, using defaults")
    const defaultCommissionRates: Record<string, { charge: number; sale: number }> = {
      "Booking.com": { charge: 3.0, sale: 15.0 },
      "Airbnb": { charge: 3.0, sale: 12.0 },
      "Expedia": { charge: 4.0, sale: 18.0 },
      "VRBO": { charge: 3.0, sale: 15.0 },
      "Direct": { charge: 0.0, sale: 0.0 },
    }
    return defaultCommissionRates[channelName] || { charge: 0.0, sale: 0.0 }
  } catch (error) {
    console.error("Error getting channel commissions:", error)
    // Return safe defaults
    return { charge: 0.0, sale: 0.0 }
  }
}

/**
 * Calculate commission amounts for a booking
 */
export function calculateBookingCommissions(
  totalAmount: number,
  commissionRates: { charge: number; sale: number }
) {
  const saleCommission = (totalAmount * commissionRates.sale) / 100
  const chargeCommission = (totalAmount * commissionRates.charge) / 100
  const totalCommission = saleCommission + chargeCommission
  const netAmount = totalAmount - totalCommission

  return {
    commission_rate: commissionRates.sale,
    commission_amount: saleCommission,
    collection_commission: chargeCommission,
    total_commission: totalCommission,
    net_amount: netAmount,
  }
}

/**
 * Calculate full booking financial details
 */
export async function calculateBookingFinancials(
  propertyId: string,
  channelName: string,
  totalAmount: number
) {
  const commissionRates = await getChannelCommissions(propertyId, channelName)
  return calculateBookingCommissions(totalAmount, commissionRates)
}

/**
 * Get available distribution channels for a property
 */
export async function getPropertyChannels(propertyId: string) {
  try {


    const { data, error } = await supabaseClient
      .from("property_channels")
      .select(`
        distribution_channels (
          id,
          name
        )
      `)
      .eq("property_id", propertyId)
      .eq("is_enabled", true)

    console.log("📊 Property channels data:", data)
    console.log("❌ Property channels error:", error)

    if (error) {
      console.error("Error fetching property channels:", error)
      // Return only Direct channel if property_channels query fails
      return [
        { id: "direct", name: "Direct" }
      ]
    }

    // Transform the data to match expected format
    if (data && Array.isArray(data)) {
      const channels = data.map((item: any) => ({
        id: item.distribution_channels?.id || "unknown",
        name: item.distribution_channels?.name || "Unknown",
      }))
      
      // Always include Direct channel
      const directChannel = { id: "direct", name: "Direct" }
      const allChannels = [directChannel, ...channels]
      
      // Remove duplicates based on name
      const uniqueChannels = allChannels.filter((channel, index, self) => 
        index === self.findIndex(c => c.name === channel.name)
      )
      
      console.log("✅ Final channels for booking form:", uniqueChannels)
      return uniqueChannels
    }

    // Return only Direct channel if no data
    return [
      { id: "direct", name: "Direct" }
    ]
  } catch (error) {
    console.error("Error getting property channels:", error)
    return [
      { id: "direct", name: "Direct" }
    ]
  }
}

// Export the single instance of the client
export { supabaseClient as supabase }
