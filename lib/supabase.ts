import { createClient } from "@supabase/supabase-js"

// Use fallback values for demo purposes if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Create client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Mock data for demo when Supabase is not configured
export const mockData = {
  properties: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Apartamento Centro Madrid",
      description: "Hermoso apartamento en el centro de Madrid con todas las comodidades",
      address: "Calle Gran Vía 25",
      city: "Madrid",
      country: "España",
      property_type: "apartment",
      bedrooms: 2,
      bathrooms: 1,
      max_guests: 4,
      base_price: 85.0,
      cleaning_fee: 25.0,
      cover_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      ],
      amenities: ["WiFi", "Aire acondicionado", "Cocina equipada", "TV"],
      status: "active",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Loft Barcelona Gótico",
      description: "Loft moderno en el barrio gótico de Barcelona",
      address: "Carrer del Bisbe 10",
      city: "Barcelona",
      country: "España",
      property_type: "loft",
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 2,
      base_price: 95.0,
      cleaning_fee: 30.0,
      cover_image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      ],
      amenities: ["WiFi", "Aire acondicionado", "Balcón", "TV"],
      status: "active",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Casa Valencia Playa",
      description: "Casa cerca de la playa en Valencia",
      address: "Avenida del Puerto 15",
      city: "Valencia",
      country: "España",
      property_type: "house",
      bedrooms: 3,
      bathrooms: 2,
      max_guests: 6,
      base_price: 120.0,
      cleaning_fee: 40.0,
      cover_image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
      ],
      amenities: ["WiFi", "Piscina", "Jardín", "Barbacoa", "TV"],
      status: "active",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
  ],
  guests: [
    {
      id: "650e8400-e29b-41d4-a716-446655440001",
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@email.com",
      phone: "+1234567890",
      country: "USA",
      date_of_birth: "1985-06-15",
      id_number: "",
      notes: "",
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-10T10:00:00Z",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440002",
      first_name: "Maria",
      last_name: "García",
      email: "maria.garcia@email.com",
      phone: "+34666777888",
      country: "España",
      date_of_birth: "1990-03-22",
      id_number: "",
      notes: "",
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-10T10:00:00Z",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440003",
      first_name: "Pierre",
      last_name: "Dubois",
      email: "pierre.dubois@email.com",
      phone: "+33123456789",
      country: "Francia",
      date_of_birth: "1988-11-08",
      id_number: "",
      notes: "",
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-10T10:00:00Z",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440004",
      first_name: "Anna",
      last_name: "Mueller",
      email: "anna.mueller@email.com",
      phone: "+49987654321",
      country: "Alemania",
      date_of_birth: "1992-07-14",
      id_number: "",
      notes: "",
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-10T10:00:00Z",
    },
  ],
  bookings: [
    {
      id: "750e8400-e29b-41d4-a716-446655440001",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      guest_id: "650e8400-e29b-41d4-a716-446655440001",
      check_in: "2024-02-15",
      check_out: "2024-02-20",
      guests_count: 2,
      total_amount: 450.0,
      commission_rate: 15.0,
      commission_amount: 67.5,
      net_amount: 382.5,
      status: "confirmed",
      booking_source: "Booking.com",
      special_requests: "",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440002",
      property_id: "550e8400-e29b-41d4-a716-446655440002",
      guest_id: "650e8400-e29b-41d4-a716-446655440002",
      check_in: "2024-02-10",
      check_out: "2024-02-14",
      guests_count: 2,
      total_amount: 410.0,
      commission_rate: 12.0,
      commission_amount: 49.2,
      net_amount: 360.8,
      status: "confirmed",
      booking_source: "Airbnb",
      special_requests: "",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440003",
      property_id: "550e8400-e29b-41d4-a716-446655440003",
      guest_id: "650e8400-e29b-41d4-a716-446655440003",
      check_in: "2024-03-01",
      check_out: "2024-03-07",
      guests_count: 4,
      total_amount: 760.0,
      commission_rate: 0.0,
      commission_amount: 0.0,
      net_amount: 760.0,
      status: "pending",
      booking_source: "Direct",
      special_requests: "Late check-in requested",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
    {
      id: "750e8400-e29b-41d4-a716-446655440004",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      guest_id: "650e8400-e29b-41d4-a716-446655440004",
      check_in: "2024-03-15",
      check_out: "2024-03-18",
      guests_count: 2,
      total_amount: 280.0,
      commission_rate: 18.0,
      commission_amount: 50.4,
      net_amount: 229.6,
      status: "confirmed",
      booking_source: "Expedia",
      special_requests: "",
      created_at: "2024-01-20T10:00:00Z",
      updated_at: "2024-01-20T10:00:00Z",
    },
  ],
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
  propertyExpenses: [
    {
      id: "pe1",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      booking_id: null,
      expense_type: "cleaning",
      category: "operational",
      description: "Limpieza post check-out",
      amount: 35.0,
      expense_date: "2024-02-20",
      payment_method: "cash",
      receipt_url: "",
      vendor_name: "Limpieza Madrid SL",
      is_recurring: false,
      recurring_frequency: "",
      status: "paid",
      created_at: "2024-02-20T10:00:00Z",
      updated_at: "2024-02-20T10:00:00Z",
    },
    {
      id: "pe2",
      property_id: "550e8400-e29b-41d4-a716-446655440001",
      booking_id: null,
      expense_type: "maintenance",
      category: "maintenance",
      description: "Reparación grifo cocina",
      amount: 85.0,
      expense_date: "2024-02-18",
      payment_method: "transfer",
      receipt_url: "",
      vendor_name: "Fontanería Express",
      is_recurring: false,
      recurring_frequency: "",
      status: "paid",
      created_at: "2024-02-18T10:00:00Z",
      updated_at: "2024-02-18T10:00:00Z",
    },
    {
      id: "pe3",
      property_id: "550e8400-e29b-41d4-a716-446655440003",
      booking_id: null,
      expense_type: "utilities",
      category: "operational",
      description: "Factura electricidad febrero",
      amount: 120.0,
      expense_date: "2024-02-28",
      payment_method: "transfer",
      receipt_url: "",
      vendor_name: "Iberdrola",
      is_recurring: true,
      recurring_frequency: "monthly",
      status: "pending",
      created_at: "2024-02-28T10:00:00Z",
      updated_at: "2024-02-28T10:00:00Z",
    },
  ],
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

// Check if we're in demo mode (no proper Supabase configuration)
export const isDemoMode = supabaseUrl === "https://demo.supabase.co" || supabaseAnonKey === "demo-key"

// Types
export interface Property {
  id: string
  owner_id: string
  name: string
  description: string
  address: string
  city: string
  country: string
  property_type: string
  bedrooms: number
  bathrooms: number
  max_guests: number
  base_price: number
  cleaning_fee: number
  cover_image?: string
  images: string[]
  amenities: string[]
  status: string
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
  net_amount?: number
  status: string
  booking_source: string
  special_requests?: string
  created_at: string
  updated_at: string
  property?: Property
  guest?: Guest
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
