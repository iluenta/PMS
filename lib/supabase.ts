import { createClient, SupabaseClient } from "@supabase/supabase-js"

// ============================================================================
// Mock Data (for Demo Mode)
// ============================================================================

const mockProperties = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Luxury Apartment in Madrid",
    description: "A spacious and modern apartment in the heart of Madrid, perfect for a family or a group of friends.",
    type: "Apartment",
    address: "Calle de Ruiz de Alarcón, 23, 28014 Madrid",
      city: "Madrid",
    postal_code: "28014",
    country: "Spain",
      bedrooms: 2,
      bathrooms: 1,
    capacity: 4,
    area: 60,
    base_price: 100,
    cleaning_fee: 20,
    security_deposit: 100,
    check_in_time: "15:00",
    check_out_time: "11:00",
    min_stay: 1,
    max_stay: 30,
    is_active: true,
      images: [
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
    ],
    amenities: ["WiFi", "Aire acondicionado", "Cocina completa", "Baño privado"],
      status: "active",
    channel_ratings: {
      Booking: 4.5,
      Airbnb: 4.8,
      Expedia: 4.2,
    },
    channel_configuration: {
      Booking: {
        api_key: "your_booking_api_key",
        channel_type: "ota",
      },
      Airbnb: {
        api_key: "your_airbnb_api_key",
        channel_type: "ota",
      },
      Expedia: {
        api_key: "your_expedia_api_key",
        channel_type: "ota",
      },
    },
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Cozy Studio in Barcelona",
    description: "A cozy and comfortable studio in the Gothic Quarter of Barcelona.",
    type: "Studio",
    address: "Calle de Cuchilleros, 17, 28005 Barcelona",
      city: "Barcelona",
    postal_code: "08003",
    country: "Spain",
    bedrooms: 0,
      bathrooms: 1,
    capacity: 2,
    area: 30,
    base_price: 50,
    cleaning_fee: 10,
    security_deposit: 50,
    check_in_time: "14:00",
    check_out_time: "10:00",
    min_stay: 1,
    max_stay: 30,
    is_active: true,
      images: [
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
    ],
    amenities: ["WiFi", "Aire acondicionado", "Baño privado"],
      status: "active",
    channel_ratings: {
      Booking: 4.0,
      Airbnb: 4.5,
      Expedia: 3.8,
    },
    channel_configuration: {
      Booking: {
        api_key: "your_booking_api_key",
        channel_type: "ota",
      },
      Airbnb: {
        api_key: "your_airbnb_api_key",
        channel_type: "ota",
      },
      Expedia: {
        api_key: "your_expedia_api_key",
        channel_type: "ota",
      },
    },
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Modern Loft in Valencia",
    description: "A modern and stylish loft in the heart of Valencia, close to the beach.",
    type: "Loft",
    address: "Calle de San Vicente, 10, 46003 Valencia",
      city: "Valencia",
    postal_code: "46003",
    country: "Spain",
    bedrooms: 1,
    bathrooms: 1,
    capacity: 2,
    area: 40,
    base_price: 70,
    cleaning_fee: 15,
    security_deposit: 70,
    check_in_time: "16:00",
    check_out_time: "11:00",
    min_stay: 1,
    max_stay: 30,
    is_active: true,
      images: [
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
      "https://via.placeholder.com/600x400",
    ],
    amenities: ["WiFi", "Aire acondicionado", "Cocina completa", "Baño privado"],
    status: "pending",
    created_at: "2024-02-28T10:00:00Z",
    updated_at: "2024-02-28T10:00:00Z",
  },
]

const mockGuests = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
      first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+34 600 123 456",
    country: "Spain",
    date_of_birth: "1990-01-01",
    id_number: "12345678Z",
    notes: "Regular guest",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone: "+34 600 789 012",
    country: "Spain",
    date_of_birth: "1995-05-10",
    id_number: "87654321Y",
    notes: "VIP guest",
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-10T10:00:00Z",
    },
    {
    id: "550e8400-e29b-41d4-a716-446655440003",
    first_name: "Peter",
    last_name: "Jones",
    email: "peter.jones@example.com",
    phone: "+34 600 234 567",
    country: "Spain",
    date_of_birth: "2000-11-20",
    id_number: "11223344A",
    notes: "First-time guest",
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
  },
]

const mockBookings = [
    {
      id: "750e8400-e29b-41d4-a716-446655440001",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
    guest_id: "550e8400-e29b-41d4-a716-446655440001",
    check_in: "2024-01-20",
    check_out: "2024-01-25",
      guests_count: 2,
    total_amount: 500,
      commission_rate: 15.0,
    commission_amount: 75,
    net_amount: 425,
    status: "completed",
      booking_source: "Booking.com",
    special_requests: "No special requests",
      created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-25T10:00:00Z",
    property: mockProperties[0],
    guest: mockGuests[0],
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440002",
      property_id: "550e8400-e29b-41d4-a716-446655440002",
    guest_id: "550e8400-e29b-41d4-a716-446655440002",
    check_in: "2024-02-14",
    check_out: "2024-02-16",
    guests_count: 1,
    total_amount: 200,
      commission_rate: 12.0,
    commission_amount: 24,
    net_amount: 176,
    status: "completed",
      booking_source: "Airbnb",
    special_requests: "Late check-in after 20:00",
    created_at: "2024-02-14T10:00:00Z",
    updated_at: "2024-02-16T10:00:00Z",
    property: mockProperties[1],
    guest: mockGuests[1],
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440003",
      property_id: "550e8400-e29b-41d4-a716-446655440003",
    guest_id: "550e8400-e29b-41d4-a716-446655440003",
    check_in: "2024-01-20",
    check_out: "2024-01-22",
    guests_count: 2,
    total_amount: 400,
    commission_rate: 18.0,
    commission_amount: 72,
    net_amount: 328,
      status: "pending",
    booking_source: "Expedia",
    special_requests: "Breakfast included",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-22T10:00:00Z",
    property: mockProperties[2],
    guest: mockGuests[2],
  },
]

const mockExpenses = [
  {
    id: "pe1",
    property_id: "550e8400-e29b-41d4-a716-446655440001",
    booking_id: "750e8400-e29b-41d4-a716-446655440001",
    expense_type: "Cleaning",
    category: "General",
    description: "Regular cleaning of the apartment.",
    amount: 50,
    expense_date: "2024-01-20",
    payment_method: "Cash",
    receipt_url: "https://via.placeholder.com/150x100",
    vendor_name: "Cleaning Service",
    is_recurring: false,
    status: "completed",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
    {
    id: "pe2",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
    booking_id: "750e8400-e29b-41d4-a716-446655440001",
    expense_type: "Maintenance",
    category: "Repairs",
    description: "Fixing a leaky faucet.",
    amount: 20,
    expense_date: "2024-01-25",
    payment_method: "Bank Transfer",
    receipt_url: "https://via.placeholder.com/150x100",
    vendor_name: "Handyman Service",
    is_recurring: false,
    status: "completed",
    created_at: "2024-01-25T10:00:00Z",
    updated_at: "2024-01-25T10:00:00Z",
  },
  {
    id: "pe3",
    property_id: "550e8400-e29b-41d4-a716-446655440002",
    booking_id: "750e8400-e29b-41d4-a716-446655440002",
    expense_type: "Utilities",
    category: "Electricity",
    description: "Electricity bill for February.",
    amount: 100,
    expense_date: "2024-02-01",
    payment_method: "Credit Card",
    receipt_url: "https://via.placeholder.com/150x100",
    vendor_name: "Electricity Company",
    is_recurring: true,
    recurring_frequency: "monthly",
    status: "pending",
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
  },
]

// ============================================================================
// Supabase Client Initialization (Singleton Pattern)
// ============================================================================

let supabase: SupabaseClient

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
        console.warn("Supabase URL or Anon Key is missing, but not in demo mode. Auth will likely fail.")
      }
      // In demo mode or if keys are missing, we don't create a real client
    } else {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    }
  }
  return supabase
}

// Initialize the client
const supabaseClient = getSupabaseClient()

// ============================================================================
// Demo Mode Configuration
// ============================================================================

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !supabaseClient

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
  property_rating: number
  property_review_count: number
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

export interface TravelerGuideSection {
  id: string
  property_id: string
  section_type: string
  title: string
  content?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  items?: TravelerGuideItem[]
}

export interface TravelerGuideItem {
  id: string
  section_id: string
  title: string
  description?: string
  address?: string
  phone?: string
  website?: string
  image_url?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
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

// ============================================================================
// Mock Data (for Demo Mode)
// ============================================================================

export const mockData = {
  properties: mockProperties,
  guests: mockGuests,
  bookings: mockBookings,
  commissionSettings: [
    {
      id: "cs1",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      channel_name: "Booking.com",
      channel_type: "ota",
      commission_rate: 15.0,
      commission_type: "percentage",
      fixed_amount: 0,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "cs2",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      channel_name: "Airbnb",
      channel_type: "ota",
      commission_rate: 12.0,
      commission_type: "percentage",
      fixed_amount: 0,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "cs3",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      channel_name: "Expedia",
      channel_type: "ota",
      commission_rate: 18.0,
      commission_type: "percentage",
      fixed_amount: 0,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "cs4",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      channel_name: "Canal Directo",
      channel_type: "direct",
      commission_rate: 0.0,
      commission_type: "percentage",
      fixed_amount: 0,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
  ],
  bookingPayments: [
    {
      id: "bp1",
      booking_id: "750e8400-e29b-41d4-a716-446655440001",
      payment_type: "deposit",
      amount: 225.0,
      commission_amount: 33.75,
      net_amount: 191.25,
      payment_method: "card",
      payment_status: "completed",
      payment_date: "2024-01-20",
      reference_number: "PAY-001",
      notes: "",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
    {
      id: "bp2",
      booking_id: "750e8400-e29b-41d4-a716-446655440001",
      payment_type: "balance",
      amount: 225.0,
      commission_amount: 33.75,
      net_amount: 191.25,
      payment_method: "card",
      payment_status: "completed",
      payment_date: "2024-02-14",
      reference_number: "PAY-002",
      notes: "",
      created_at: "2024-02-14T10:00:00Z",
      updated_at: "2024-02-14T10:00:00Z",
    },
    {
      id: "bp3",
      booking_id: "750e8400-e29b-41d4-a716-446655440002",
      payment_type: "deposit",
      amount: 205.0,
      commission_amount: 24.6,
      net_amount: 180.4,
      payment_method: "paypal",
      payment_status: "completed",
      payment_date: "2024-01-20",
      reference_number: "PAY-003",
      notes: "",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
  ],
  propertyExpenses: mockExpenses,
  travelerGuideSections: [
    {
      id: "tgs1",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "checkin",
      title: "Información de Check-in",
      content:
        "El check-in es a partir de las 15:00h. Encontrarás las llaves en la caja fuerte ubicada en la entrada del edificio. El código te será enviado el día de tu llegada.",
      order_index: 1,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgs2",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "apartment_info",
      title: "Información del Apartamento",
      content:
        "Apartamento de 2 habitaciones en pleno centro de Madrid. WiFi gratuito, aire acondicionado y cocina completamente equipada.",
      order_index: 2,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgs3",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "places_to_visit",
      title: "Lugares que Visitar",
      content: "Madrid ofrece increíbles lugares para visitar cerca del apartamento.",
      order_index: 3,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgs4",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "restaurants",
      title: "Restaurantes Recomendados",
      content: "Los mejores restaurantes cerca del apartamento.",
      order_index: 4,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgs5",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "emergency_contacts",
      title: "Contactos de Emergencia",
      content: "Números importantes durante tu estancia.",
      order_index: 5,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgs6",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      section_type: "house_rules",
      title: "Normas de la Casa",
      content:
        "No se permite fumar en el interior del apartamento. Horario de silencio de 22:00 a 8:00. Máximo 4 huéspedes. No se permiten fiestas. Mantén el apartamento limpio y ordenado.",
      order_index: 6,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
  ],
  travelerGuideItems: [
    {
      id: "tgi1",
      section_id: "tgs3",
      title: "Museo del Prado",
      description: "Uno de los museos más importantes del mundo con obras de Velázquez, Goya y El Greco.",
      address: "Calle de Ruiz de Alarcón, 23, 28014 Madrid",
      phone: "",
      website: "",
      image_url: "",
      order_index: 1,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgi2",
      section_id: "tgs3",
      title: "Parque del Retiro",
      description: "Hermoso parque en el centro de Madrid, perfecto para pasear y relajarse.",
      address: "Plaza de la Independencia, 7, 28001 Madrid",
      phone: "",
      website: "",
      image_url: "",
      order_index: 2,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgi3",
      section_id: "tgs4",
      title: "Casa Botín",
      description: "El restaurante más antiguo del mundo según el Guinness. Especialidad en cochinillo.",
      address: "Calle de Cuchilleros, 17, 28005 Madrid",
      phone: "+34 913 66 42 17",
      website: "",
      image_url: "",
      order_index: 1,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgi4",
      section_id: "tgs5",
      title: "Emergencias Generales",
      description: "Policía, Bomberos, Ambulancia",
      address: "",
      phone: "112",
      website: "",
      image_url: "",
      order_index: 1,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "tgi5",
      section_id: "tgs5",
      title: "Anfitrión",
      description: "Contacto directo con el propietario",
      address: "",
      phone: "+34 600 123 456",
      website: "",
      image_url: "",
      order_index: 3,
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
  ],
  availabilitySettings: [
    {
      id: "as1",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      min_nights: 2,
      max_nights: 14,
      advance_booking_days: 1,
      max_advance_booking_days: 180,
      check_in_days: ["friday", "saturday", "sunday"],
      check_out_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "as2",
      property_id: "550e8400-e29b-41d4-a716-446655440002",
      min_nights: 3,
      max_nights: 21,
      advance_booking_days: 2,
      max_advance_booking_days: 365,
      check_in_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      check_out_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
    {
      id: "as3",
      property_id: "550e8400-e29b-41d4-a716-446655440003",
      min_nights: 1,
      max_nights: 30,
      advance_booking_days: 0,
      max_advance_booking_days: 90,
      check_in_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      check_out_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      is_active: true,
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
  ],
}

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
    console.log("Expired tokens cleared, user signed out.")
  }
}

// ============================================================================
// Commission Calculation Functions
// ============================================================================

/**
 * Get commission rates for a specific property and channel
 */
export async function getChannelCommissions(propertyId: string, channelName: string) {
  try {
    console.log("🔄 Getting channel commissions for:", { propertyId, channelName })

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
    console.log("🔄 Getting property channels for property:", propertyId)

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
      const channels = data.map((item) => ({
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
