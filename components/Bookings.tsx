"use client"

import type React from "react"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  supabase, 
  type Booking, 
  type Property, 
  type Guest, 
  type Reservation,
  calculateRequiredAmount,
  calculateRequiredAmountWithVat,
  calculatePaymentStatus
} from "@/lib/supabase"
import { getActivePropertyChannels } from "@/lib/channels"
import type { PropertyChannelWithDetails } from "@/types/channels"
import { useProperty } from "@/hooks/useProperty"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Calendar, 
  Plus, 
  Edit, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Mail, 
  Phone,
  CreditCard,
  TrendingUp,
  Wallet,
  Search,
  Filter,
  MessageSquare,
  Trash2,
  DollarSign,
  XCircle,
  Loader2
} from "lucide-react"
import { GuestPicker } from '@/components/people/GuestPicker'
import { ReservationStatusSelect } from '@/components/ui/reservation-status'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
  calculateReservationAmountsWithVat,
  getReservationPaymentSummary,
  getVatConfigFromReservation,
  VatConfig
} from "@/lib/utils/financial"

export default function Bookings() {

  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [reservationPayments, setReservationPayments] = useState<{[key: string]: any[]}>({})
  const [propertyChannels, setPropertyChannels] = useState<PropertyChannelWithDetails[]>([])

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("pending")
  const [sortFilter, setSortFilter] = useState<string>("checkin_asc")
  const [showOnlyCancelled, setShowOnlyCancelled] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())

  // Global property context
  const { selectedProperty } = useProperty()
  const { user, loading: authLoading } = useAuth()
  
  // Función para obtener años disponibles basados en datos existentes
  const getAvailableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = new Set<number>()
    
    // Años disponibles basados en las reservas existentes
    bookings.forEach(b => {
      if (b.check_in) {
        years.add(new Date(b.check_in).getFullYear())
      }
    })
    
    // Siempre incluir el año actual
    years.add(currentYear)
    
    // Ordenar de más reciente a más antiguo
    return Array.from(years).sort((a, b) => b - a)
  }, [bookings])

  // Función para verificar si una fecha está en el año seleccionado
  const isDateInYear = (date: string, year: string) => {
    if (year === "all") return true
    const dateYear = new Date(date).getFullYear().toString()
    return dateYear === year
  }
  
  // Debug: verificar que el contexto de autenticación funciona
  
  // Si la autenticación está cargando, mostrar spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // Si no hay usuario autenticado, mostrar mensaje
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No autenticado</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder a las reservas</p>
        </div>
      </div>
    )
  }
  


  // Filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings]

    // Search filter (name, email, property)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((booking) => {
        const guestName = booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}`.toLowerCase() : ""
        const guestEmail = booking.guest?.email?.toLowerCase() || ""
        const propertyName = booking.property?.name?.toLowerCase() || ""
        
        return guestName.includes(search) || 
               guestEmail.includes(search) || 
               propertyName.includes(search)
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    // Channel filter
    if (channelFilter !== "all") {
      filtered = filtered.filter((booking) => booking.booking_source === channelFilter)
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter((booking) => {
        const checkInDate = new Date(booking.check_in)
        const daysDiff = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateRangeFilter) {
          case "pending":
            return checkInDate > today
          case "today":
            return daysDiff === 0
          case "this_week":
            return daysDiff >= 0 && daysDiff <= 7
          case "this_month":
            return checkInDate.getMonth() === now.getMonth() && checkInDate.getFullYear() === now.getFullYear()
          case "past":
            return checkInDate < today
          default:
            return true
        }
      })
    }

    // Year filter (basado en check_in)
    if (yearFilter !== "all") {
      filtered = filtered.filter((booking) => isDateInYear(booking.check_in, yearFilter))
    }

    // Sort filter
    filtered.sort((a, b) => {
      switch (sortFilter) {
        case "newest":
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        case "oldest":
          return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
        case "checkin_asc":
          return new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
        case "checkin_desc":
          return new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
        case "amount_asc":
          return (a.total_amount || 0) - (b.total_amount || 0)
        case "amount_desc":
          return (b.total_amount || 0) - (a.total_amount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [bookings, searchTerm, statusFilter, channelFilter, dateRangeFilter, sortFilter, selectedProperty, yearFilter])

  // Get unique channels for filter
  const availableChannels = useMemo(() => {
    const channels = [...new Set(bookings.map(b => b.booking_source).filter(Boolean))]
    return channels
  }, [bookings])

  // Calculate statistics based on filtered bookings
  const statistics = useMemo(() => {
    const total = filteredBookings.length
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length
    
    // Calculate revenue based on showOnlyCancelled filter
    let revenue: number
    let revenueLabel: string
    let revenueColor: string
    
    if (showOnlyCancelled) {
      // Show only cancelled bookings revenue in red
      revenue = filteredBookings
        .filter(b => b.status === 'cancelled')
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      revenueLabel = "Ingresos Canceladas"
      revenueColor = "text-red-600"
    } else {
      // Show all bookings except cancelled in black
      revenue = filteredBookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      revenueLabel = "Ingresos"
      revenueColor = "text-gray-900"
    }

    return {
      total,
      confirmed,
      cancelled,
      revenue,
      revenueLabel,
      revenueColor
    }
  }, [filteredBookings, showOnlyCancelled])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query - FILTRAR por tenant_id del usuario autenticado
      const query = supabase
        .from("reservations")
        .select(`
          *,
          property_channels!reservations_property_channel_fkey(
            *,
            channel:distribution_channels(*)
          )
        `)
        .eq("tenant_id", user?.tenant_id) // FILTRO CRÍTICO DE SEGURIDAD
        .order("created_at", { ascending: false })

      const { data: reservationsData, error: reservationsError } = await query

      if (reservationsError) {
        console.error("Error fetching reservations:", reservationsError)
      }

      // Fetch properties for the form (only from current tenant)
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("tenant_id", user?.tenant_id)

      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError)
      }

      if (reservationsData) {
        // Transform reservations data to match our Booking interface
        const transformedReservations = reservationsData.map((reservation) => {
          // Determine booking_source with better logic
          let bookingSource = 'Direct' // Default
          if (reservation.property_channels?.channel?.name) {
            bookingSource = reservation.property_channels.channel.name
          } else if (reservation.external_source) {
            bookingSource = reservation.external_source
          }
          
          return {
            ...reservation,
            guest_id: 'guest-jsonb', // Since guest is JSONB, we use a placeholder
            guests_count: reservation.guests || reservation.adults + reservation.children || 1,
            booking_source: bookingSource,
            external_id: reservation.external_id || null,
            // Ensure commission fields are properly included
            channel_commission: reservation.channel_commission || 0,
            collection_commission: reservation.collection_commission || 0,
            // Include payment_status from reservation
            payment_status: reservation.payment_status || 'pending',
            // Transform the JSONB guest field to match expected structure
            property: null, // We'll handle this separately
            guest: reservation.guest ? {
              id: 'guest-jsonb',
              first_name: reservation.guest.name ? reservation.guest.name.split(' ')[0] : '',
              last_name: reservation.guest.name ? reservation.guest.name.split(' ').slice(1).join(' ') : '',
              email: reservation.guest.email || '',
              phone: reservation.guest.phone || '',
              country: reservation.guest.country || '',
              date_of_birth: null,
              id_number: reservation.guest.document_number || '',
              notes: `${reservation.guest.document_type || ''}: ${reservation.guest.document_number || ''}`.trim(),
              created_at: reservation.created_at,
              updated_at: reservation.updated_at
            } : null
          }
        })
        
        setBookings(transformedReservations)
      }
      
      if (propertiesData) setProperties(propertiesData)
      
      // Set empty array since we handle guest data differently
      setGuests([])
      
      // Fetch payments for all reservations in one query (optimized)
      if (reservationsData && reservationsData.length > 0) {
        const reservationIds = reservationsData.map(r => r.id)
        
        // Single query for all payments
        const { data: allPaymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .in("reservation_id", reservationIds)
          .eq("status", "completed") // Only get completed payments

        // Group payments by reservation_id
        const paymentsMap: {[key: string]: any[]} = {}
        
        // Initialize all reservations with empty arrays
        reservationIds.forEach(id => {
          paymentsMap[id] = []
        })
        
        // Group payments by reservation_id
        if (allPaymentsData) {
          allPaymentsData.forEach(payment => {
            if (payment.reservation_id && paymentsMap[payment.reservation_id]) {
              paymentsMap[payment.reservation_id].push(payment)
            }
          })
        }
        
        setReservationPayments(paymentsMap)
      }

      // If no data exists, show information about it
      if (!reservationsData || reservationsData.length === 0) {
        // No reservations found
      }
      if (!propertiesData || propertiesData.length === 0) {
        // No properties found
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.tenant_id])

  useEffect(() => {
    if (user?.tenant_id) {
      fetchData()
    }
  }, [user?.tenant_id, fetchData])

  // Load property channels when selected property changes
  useEffect(() => {
    const loadChannels = async () => {
      if (selectedProperty?.id) {
        try {
          const channels = await getActivePropertyChannels(selectedProperty.id)
          setPropertyChannels(channels)
        } catch (error) {
          console.error('Error loading property channels:', error)
          setPropertyChannels([])
        }
      } else {
        setPropertyChannels([])
      }
    }
    
    loadChannels()
  }, [selectedProperty?.id])

  // Memoize properties to avoid unnecessary re-renders
  const memoizedProperties = useMemo(() => properties, [properties])
  const memoizedGuests = useMemo(() => guests, [guests])
  const memoizedReservationPayments = useMemo(() => reservationPayments, [reservationPayments])

  // Función para obtener el color del estado desde settings
  const getStatusColor = (status: string) => {
    // Mapeo de estados en inglés a español para compatibilidad
    const statusMap: { [key: string]: string } = {
      "confirmed": "Confirmada",
      "pending": "Pendiente", 
      "cancelled": "Cancelada",
      "completed": "Completada",
      "reserved": "Reservada"
    }
    
    // Retornar color por defecto si no hay configuración
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "reserved":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el texto del estado en español
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "confirmed": "Confirmada",
      "pending": "Pendiente", 
      "cancelled": "Cancelada",
      "completed": "Completada",
      "reserved": "Reservada"
    }
    return statusMap[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "reserved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "pending":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Función para obtener el texto del estado de pago en español
  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "paid": "Pagado",
      "pending": "Pendiente",
      "partial": "Parcial",
      "refunded": "Reembolsado"
    }
    return statusMap[status] || status
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "partial":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBooking(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      try {
        const { error } = await supabase
          .from("reservations")
          .delete()
          .eq("id", id)

        if (error) {
        } else {
          fetchData()
        }
      } catch (error) {
      }
    }
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Función unificada para calcular el importe requerido y estado del pago
  const calculatePaymentInfo = (booking: Booking, payments: any[] = []) => {
    const reservation: Reservation = {
      id: booking.id || '',
      guest: booking.guest ? {
        name: `${booking.guest.first_name} ${booking.guest.last_name}`,
        email: booking.guest.email || '',
        phone: booking.guest.phone || '',
      } : {},
      property_id: booking.property_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights: calculateNights(booking.check_in, booking.check_out),
      guests: booking.guests_count || 0,
      adults: booking.guests_count || 0,
      children: 0,
      status: booking.status,
      payment_status: booking.payment_status || 'pending',
      total_amount: booking.total_amount || 0,
      base_amount: booking.total_amount || 0,
      cleaning_fee: 0,
      taxes: 0,
      channel: booking.booking_source,
      notes: booking.notes || '',
      special_requests: booking.special_requests || '',
      external_id: booking.external_id || undefined,
      external_source: booking.booking_source,
      ical_uid: undefined,
      channel_commission: booking.channel_commission || 0,
      collection_commission: booking.collection_commission || 0,
      property_channel_id: booking.property_channel_id || '',
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      property: booking.property,
      property_channel: booking.property_channel,
    }

    const vatConfig = getVatConfigFromReservation(reservation)
    const summary = getReservationPaymentSummary(reservation, payments, vatConfig)
    const amounts = calculateReservationAmountsWithVat(reservation, vatConfig)

    return {
      requiredAmount: summary.requiredAmount,
      paymentStatus: summary.status,
      totalPayments: summary.totalPaid,
      pendingAmount: summary.pendingAmount,
      vatInfo: {
        applyVat: vatConfig.applyVat,
        vatPercent: vatConfig.vatPercent,
        vatAmount: amounts.vatAmount,
      },
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="mt-2 text-gray-600">Gestiona todas las reservas de tus propiedades</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <BookingDialog
            booking={editingBooking}
            properties={memoizedProperties}
            guests={memoizedGuests}
            onClose={() => setIsDialogOpen(false)}
            onSave={fetchData}
            reservationPayments={memoizedReservationPayments}
            calculatePaymentInfo={calculatePaymentInfo}
          />
        </Dialog>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reservas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {bookings.length} total{bookings.length !== statistics.total ? ` (${statistics.total} filtradas)` : ''}
            </p>
          </CardContent>
        </Card>

        {/* Confirmadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statistics.confirmed}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.total > 0 ? Math.round((statistics.confirmed / statistics.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        {/* Canceladas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Canceladas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{statistics.cancelled}</div>
            <p className="text-xs text-gray-500 mt-1">
              {statistics.total > 0 ? Math.round((statistics.cancelled / statistics.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        {/* Ingresos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{statistics.revenueLabel}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={showOnlyCancelled ? "default" : "secondary"}
                className={`cursor-pointer transition-colors ${
                  showOnlyCancelled 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                onClick={() => setShowOnlyCancelled(!showOnlyCancelled)}
              >
                Canceladas
              </Badge>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${statistics.revenueColor}`}>
              €{statistics.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Promedio: €{(() => {
                  if (showOnlyCancelled) {
                    // Para canceladas: ingresos de canceladas / número de canceladas
                    return statistics.cancelled > 0 
                      ? (statistics.revenue / statistics.cancelled).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })
                      : '0,00'
                  } else {
                    // Para ingresos normales: ingresos / (total - canceladas)
                    return (statistics.total - statistics.cancelled) > 0 
                      ? (statistics.revenue / (statistics.total - statistics.cancelled)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })
                      : '0,00'
                  }
                })()} por reserva
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Año */}
          <div className="space-y-2">
            <Label htmlFor="year">Año</Label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {getAvailableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buscar */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nombre, email, propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Canal */}
          <div className="space-y-2">
            <Label htmlFor="channel">Canal</Label>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los canales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Rango de fechas</Label>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pendientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="this_week">Esta semana</SelectItem>
                <SelectItem value="this_month">Este mes</SelectItem>
                <SelectItem value="past">Pasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenar */}
          <div className="space-y-2">
            <Label htmlFor="sort">Ordenar</Label>
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Check-in (próximo)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes primero</SelectItem>
                <SelectItem value="oldest">Más antiguas primero</SelectItem>
                <SelectItem value="checkin_asc">Check-in (próximo)</SelectItem>
                <SelectItem value="checkin_desc">Check-in (lejano)</SelectItem>
                <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
                <SelectItem value="amount_asc">Importe (menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map((booking) => {
          const paymentsForBooking = reservationPayments?.[booking.id]
          const paymentStatusToShow = paymentsForBooking === undefined
            ? (booking.payment_status || 'pending')
            : calculatePaymentInfo(booking, paymentsForBooking).paymentStatus
          return (
            <Card key={booking.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {booking.guest?.first_name} {booking.guest?.last_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.check_in).toLocaleDateString()} – {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(booking.status)} rounded-full`}>
                    <span className="inline-flex items-center gap-1">
                      {getStatusIcon(booking.status)}
                      <span>{getStatusText(booking.status)}</span>
                    </span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-lg font-semibold text-gray-900">
                      €{(booking.total_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.property?.name || ''}{booking.booking_source ? ` • ${booking.booking_source}` : ''}
                    </p>
                  </div>
                  <Badge className={`${getPaymentStatusColor(paymentStatusToShow)} rounded-full`}>
                    <span className="inline-flex items-center gap-1">
                      {getPaymentStatusIcon(paymentStatusToShow)}
                      <span>{getPaymentStatusText(paymentStatusToShow)}</span>
                    </span>
                  </Badge>
                </div>

                {(booking.special_requests || (booking as any).notes) && (
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {booking.special_requests || (booking as any).notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(booking)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(booking.id!)}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredBookings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-500 mb-4">Las reservas aparecerán aquí cuando las recibas</p>
            <Button onClick={handleAdd} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BookingDialog({
  booking,
  properties,
  guests,
  onClose,
  onSave,
  reservationPayments,
  calculatePaymentInfo,
}: {
  booking: Booking | null
  properties: Property[]
  guests: Guest[]
  onClose: () => void
  onSave: () => void
  reservationPayments?: {[key: string]: any[]}
  calculatePaymentInfo: (booking: Booking, payments?: any[]) => { 
    requiredAmount: number; 
    paymentStatus: string; 
    totalPayments: number; 
    pendingAmount: number;
    vatInfo: {
      applyVat: boolean;
      vatPercent: number;
      vatAmount: number;
    }
  }
}) {
  const { selectedProperty } = useProperty()
  const { user, loading: authLoading } = useAuth()
  
  // Debug: verificar que el contexto de autenticación funciona en BookingDialog
  // Comentado temporalmente para evitar spam en consola
  // console.log('BookingDialog - user context:', user)
  // console.log('BookingDialog - user?.tenant_id:', user?.tenant_id)
  // console.log('BookingDialog - authLoading:', authLoading)
  
  // Si la autenticación está cargando o no hay usuario, no mostrar el diálogo
  if (authLoading || !user) {
    return null
  }
  const [formData, setFormData] = useState({
    property_id: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_country: "",
    guest_document_type: "DNI",
    guest_document_number: "",
    check_in: "",
    check_out: "",
    guests_count: 1,
    adults: 1,
    children: 0,
    base_amount: 0,
    cleaning_fee: 0,
    taxes: 0,
    total_amount: 0,
    status: "pending",
    booking_source: "Direct",
    external_id: "",
    special_requests: "",
    notes: "",
    payment_status: "pending",
    channel_commission: 0,
    collection_commission: 0,
  })
  
  const [availableChannels, setAvailableChannels] = useState<PropertyChannelWithDetails[]>([])
  const [calculatingCommissions, setCalculatingCommissions] = useState(false)
  const [dateError, setDateError] = useState<string>("")
  const [externalIdError, setExternalIdError] = useState<string>("")
  const [propertyError, setPropertyError] = useState<string>("")
  const [commissionPercentages, setCommissionPercentages] = useState<{
    sale: number | null;
    charge: number | null;
  }>({ sale: null, charge: null   })

  // Normaliza canal directo/propio para la lógica de comisiones
  const isDirectChannel = useMemo(
    () => ["Direct", "Propio"].includes(formData.booking_source),
    [formData.booking_source]
  )

  // Funciones para el estado del pago - estabilizadas con useCallback
  const getPaymentStatusColor = useCallback((status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "partial":
        return "bg-blue-100 text-blue-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const getPaymentStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "partial":
        return <DollarSign className="h-3 w-3" />
      case "refunded":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }, [])

  useEffect(() => {
    if (booking) {
      // Editing existing booking - use property from booking
      const formDataToSet = {
        property_id: booking.property_id,
        guest_name: booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}`.trim() : "",
        guest_email: booking.guest?.email || "",
        guest_phone: booking.guest?.phone || "",
        guest_country: booking.guest?.country || "",
        guest_document_type: booking.guest?.notes?.split(':')[0] || "DNI",
        guest_document_number: booking.guest?.id_number || "",
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests_count: booking.guests_count || 1,
        adults: (booking as any).adults || booking.guests_count || 1,
        children: (booking as any).children || 0,
        base_amount: (booking as any).base_amount || booking.total_amount || 0,
        cleaning_fee: (booking as any).cleaning_fee || 0,
        taxes: (booking as any).taxes || 0,
        total_amount: booking.total_amount || 0,
        status: booking.status || "pending",
        booking_source: booking.booking_source || "Direct",
        external_id: (booking as any).external_id || "",
        special_requests: booking.special_requests || "",
        notes: (booking as any).notes || "",
        payment_status: (booking as any).payment_status || "pending",
        channel_commission: booking.channel_commission || 0,
        collection_commission: booking.collection_commission || 0,
      }
      setFormData(formDataToSet)
    } else {
      // Creating new booking - use selected property from context
      const propertyId = selectedProperty?.id || ""
      setFormData({
        property_id: propertyId,
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        guest_country: "",
        guest_document_type: "DNI",
        guest_document_number: "",
        check_in: "",
        check_out: "",
        guests_count: 1,
        adults: 1,
        children: 0,
        base_amount: 0,
        cleaning_fee: 0,
        taxes: 0,
        total_amount: 0,
        status: "pending",
        booking_source: "Direct",
        external_id: "",
        special_requests: "",
        notes: "",
        payment_status: "pending",
        channel_commission: 0,
        collection_commission: 0,
      })
    }
  }, [booking, selectedProperty])

  // Load available channels when property changes
  useEffect(() => {
    if (formData.property_id) {
      loadPropertyChannels(formData.property_id)
    }
  }, [formData.property_id])

  // Recalculate total amount when base_amount, taxes, or cleaning_fee changes
  useEffect(() => {
    const newTotal = calculateTotalAmount()
    setFormData(prev => ({ ...prev, total_amount: newTotal }))
  }, [formData.base_amount, formData.taxes, formData.cleaning_fee])

  // Recalculate commissions when property or channel changes
  // Only recalc if creating (not editing) and for canal directo/propio
  useEffect(() => {
    if (formData.property_id && !booking && isDirectChannel) {
      calculateCommissions()
    }
  }, [formData.property_id, isDirectChannel, booking])

  // Recalcular comisiones cuando cambie el precio base y haya porcentajes configurados
  // SOLO en creación; en edición respetamos valores guardados en BD
  useEffect(() => {
    if (booking) return

    if (!isDirectChannel && commissionPercentages.sale !== null && commissionPercentages.charge !== null) {
      const baseAmount = formData.base_amount || 0
      const saleCommission = commissionPercentages.sale
        ? Math.round((baseAmount * commissionPercentages.sale / 100) * 100) / 100
        : 0
      const chargeCommission = commissionPercentages.charge
        ? Math.round((baseAmount * commissionPercentages.charge / 100) * 100) / 100
        : 0

      setFormData(prev => ({
        ...prev,
        channel_commission: saleCommission,
        collection_commission: chargeCommission
      }))
    }
  }, [formData.base_amount, commissionPercentages, isDirectChannel, booking])

  const loadPropertyChannels = async (propertyId: string) => {
    try {
      const channels = await getActivePropertyChannels(propertyId)
      setAvailableChannels(channels)
    } catch (error) {
      setAvailableChannels([])
    }
  }

  const calculateCommissions = async () => {
    if (!formData.property_id || !formData.booking_source) return

    setCalculatingCommissions(true)
    try {
      const [channelCommission, collectionCommission] = await Promise.all([
        calculateChannelCommission(),
        calculateCollectionCommission()
      ])

      setFormData(prev => ({
        ...prev,
        channel_commission: channelCommission,
        collection_commission: collectionCommission,
      }))
    } catch (error) {
    } finally {
      setCalculatingCommissions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar fechas
    if (formData.check_in && formData.check_out) {
      const start = new Date(formData.check_in)
      const end = new Date(formData.check_out)
      
      if (end <= start) {
        setDateError("La fecha de check-out debe ser posterior a la fecha de check-in")
        return
      }
    }

    // Validar ID de reserva externa cuando el canal no es "Propio"
    if (formData.booking_source !== "Propio" && !formData.external_id?.trim()) {
      setExternalIdError("El ID de reserva externa es obligatorio cuando el canal no es 'Propio'")
      return
    }

    try {
      // Vinculación con people: si ya hay person_id, ACTUALIZAR ese registro; si no, crear
      let personId: string | null = (formData as any).person_id || null
      const picked = (formData as any)._picked_person as any | undefined
      if (personId) {
        // Actualizar con los datos del formulario (idempotente si no hay cambios)
        try {
          const [first, ...rest] = (formData.guest_name || '').trim().split(' ')
          const peopleApi = await import('@/lib/peopleService')
          const updated = await peopleApi.updatePerson(personId, {
            first_name: first || undefined,
            last_name: rest.join(' ') || undefined,
            email: formData.guest_email || undefined,
            phone: formData.guest_phone || undefined,
            country: formData.guest_country || undefined,
          } as any)
          ;(formData as any)._picked_person = updated
        } catch (e) {
        }
      } else if (formData.guest_name || formData.guest_email || formData.guest_phone) {
        // Crear persona mínima si no hay id
        try {
          const [first, ...rest] = (formData.guest_name || '').trim().split(' ')
          const created = await (await import('@/lib/peopleService')).createPerson({
            person_type: 'guest',
            first_name: first || '',
            last_name: rest.join(' ') || '',
            email: formData.guest_email || undefined,
            phone: formData.guest_phone || undefined,
            country: formData.guest_country || undefined,
            tenant_id: user?.tenant_id, // Agregar tenant_id del usuario autenticado
          })
          personId = created.id
          ;(formData as any)._picked_person = created
        } catch {}
      }
      // Prepare guest data as JSONB
      const guestData = {
        name: `${formData.guest_name}`,
        email: formData.guest_email || '',
        phone: formData.guest_phone || '',
        country: formData.guest_country || '',
        document_type: formData.guest_document_type || '',
        document_number: formData.guest_document_number || '',
      }

      // Calculate nights
      const nights = nightsCalculation.nights

      // Get property_channel ID from channel name and property
      let property_channel_id = null
      try {
        // First, get all property channels for this property
        const { data: allChannels, error: channelsError } = await supabase
          .from("property_channels")
          .select("id, distribution_channels(name)")
          .eq("property_id", formData.property_id)
        
        if (channelsError) {
          property_channel_id = null
        }
        
        // For "Direct" bookings, look for "Propio" channel
        const channelNameToFind = formData.booking_source === "Direct" ? "Propio" : formData.booking_source
        
        // Find the channel that matches the booking_source
        const matchingChannel = allChannels?.find(channel => 
          (channel.distribution_channels as any)?.name === channelNameToFind
        )
        
        if (matchingChannel) {
          property_channel_id = matchingChannel.id
        } else {
          // If no matching channel found and it's "Direct", create one
          if (formData.booking_source === "Direct") {
            // First, get the "Propio" distribution channel
            const { data: propioChannel, error: propioError } = await supabase
              .from("distribution_channels")
              .select("id")
              .eq("name", "Propio")
              .single()
            
            if (propioError) {
              property_channel_id = null
            } else if (propioChannel) {
              // Create property_channel entry for Propio
              const { data: newPropertyChannel, error: createError } = await supabase
                .from("property_channels")
                .insert([{
                  property_id: formData.property_id,
                  channel_id: propioChannel.id,
                  is_enabled: true
                }])
                .select("id")
                .single()
              
              if (createError) {
                property_channel_id = null
              } else {
                property_channel_id = newPropertyChannel.id
              }
            } else {
              property_channel_id = null
            }
          } else {
            property_channel_id = null
          }
        }
      } catch (error) {
        property_channel_id = null
      }

      const submitData = {
        property_id: formData.property_id,
        guest: guestData, // JSONB field
        check_in: formData.check_in,
        check_out: formData.check_out,
        nights: nights,
        guests: formData.guests_count,
        adults: formData.adults,
        children: formData.children,
        status: formData.status,
        payment_status: formData.payment_status,
        total_amount: formData.total_amount,
        base_amount: formData.base_amount,
        cleaning_fee: formData.cleaning_fee,
        taxes: formData.taxes,
        property_channel_id: property_channel_id,
        notes: formData.notes,
        special_requests: formData.special_requests,
        channel_commission: formData.channel_commission,
        collection_commission: formData.collection_commission,
        external_source: formData.booking_source,
        external_id: formData.external_id || null,
        person_id: personId,
        tenant_id: user?.tenant_id // Agregar tenant_id del usuario autenticado
      }

      // Ensure we have a valid property_channel_id
      if (!property_channel_id) {
        alert("Error: No se pudo encontrar o crear el canal de distribución. Por favor, verifica la configuración del canal.")
        return
      }

      if (booking) {
        // Para edición, usar el ID de la reserva original
        const { error } = await supabase
          .from("reservations")
          .update(submitData)
          .eq("id", booking.id)
        
        if (error) {
          console.error("Error updating reservation:", error)
          alert(`Error al actualizar la reserva: ${(error as Error).message}`)
          return
        }
        onSave()
        onClose()
      } else {
        // Para creación, insertar nueva reserva
        const { error } = await supabase
          .from("reservations")
          .insert([submitData])
        
        if (error) {
          console.error("Error creating reservation:", error)
          alert(`Error al crear la reserva: ${(error as Error).message}`)
          return
        }
        onSave()
        onClose()
      }
    } catch (error) {
      alert(`Error al guardar la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const calculateNights = () => {
    if (!formData.check_in || !formData.check_out) return 0
    const start = new Date(formData.check_in)
    const end = new Date(formData.check_out)
    
    // Validar que check-out sea posterior a check-in
    if (end <= start) {
      return 0
    }
    
    const diffTime = end.getTime() - start.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calcular noches y validar fechas usando useMemo
  const nightsCalculation = useMemo(() => {
    if (!formData.check_in || !formData.check_out) return { nights: 0, error: "" }
    
    const start = new Date(formData.check_in)
    const end = new Date(formData.check_out)
    
    // Validar que check-out sea posterior a check-in
    if (end <= start) {
      return { 
        nights: 0, 
        error: "La fecha de check-out debe ser posterior a la fecha de check-in" 
      }
    }
    
    const diffTime = end.getTime() - start.getTime()
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return { nights, error: "" }
  }, [formData.check_in, formData.check_out])

  // Actualizar error de fechas cuando cambie el cálculo
  useEffect(() => {
    setDateError(nightsCalculation.error)
  }, [nightsCalculation.error])

  // Limpiar error del ID externo cuando cambie el canal a "Propio"
  useEffect(() => {
    if (formData.booking_source === "Direct" && externalIdError) {
      setExternalIdError("")
    }
  }, [formData.booking_source, externalIdError])

  // Cargar porcentajes de comisión cuando cambie el canal
  // Para nuevas reservas Y para modificación (ambos casos)
  useEffect(() => {
    if (formData.property_id && formData.booking_source && formData.booking_source !== "Direct") {
      loadCommissionPercentages()
    } else if (formData.booking_source === "Direct") {
      setCommissionPercentages({ sale: null, charge: null })
    }
  }, [formData.property_id, formData.booking_source])

  const loadCommissionPercentages = async () => {
    try {
      // Primero, obtener todos los property_channels para esta propiedad
      const { data: allChannels, error: channelsError } = await supabase
        .from("property_channels")
        .select(`
          id,
          commission_override_sale,
          commission_override_charge,
          distribution_channels(name)
        `)
        .eq("property_id", formData.property_id)

      if (channelsError) {
        setCommissionPercentages({ sale: null, charge: null })
        return
      }

      // Buscar el canal que coincida con el booking_source
      const matchingChannel = allChannels?.find(channel => 
        (channel.distribution_channels as any)?.name === formData.booking_source
      )

      if (matchingChannel) {
        setCommissionPercentages({
          sale: matchingChannel.commission_override_sale,
          charge: matchingChannel.commission_override_charge
        })
        
        // SOLO en creación: calcular y aplicar comisiones automáticamente
        if (!booking) {
          const baseAmount = formData.base_amount || 0
          const saleCommission = matchingChannel.commission_override_sale ? 
            Math.round((baseAmount * matchingChannel.commission_override_sale / 100) * 100) / 100 : 0
          const chargeCommission = matchingChannel.commission_override_charge ? 
            Math.round((baseAmount * matchingChannel.commission_override_charge / 100) * 100) / 100 : 0

          setFormData(prev => ({
            ...prev,
            channel_commission: saleCommission,
            collection_commission: chargeCommission
          }))
        }
      } else {
        setCommissionPercentages({ sale: null, charge: null })
      }
    } catch (error) {
      setCommissionPercentages({ sale: null, charge: null })
    }
  }

  const calculateTotalAmount = () => {
    return formData.base_amount + formData.taxes + formData.cleaning_fee
  }

  const calculateChannelCommission = async () => {
    if (!formData.property_id || !formData.booking_source) return 0

    try {
      const { data: propertyChannel } = await supabase
        .from("property_channels")
        .select(`
          commission_override_sale,
          channel:distribution_channels(name)
        `)
        .eq("property_id", formData.property_id)
        .eq("channel.name", formData.booking_source)
        .single()

      if (propertyChannel?.commission_override_sale && formData.base_amount > 0) {
        return formData.base_amount * (propertyChannel.commission_override_sale / 100)
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  const calculateCollectionCommission = async () => {
    if (!formData.property_id || !formData.booking_source) return 0

    try {
      const { data: propertyChannel } = await supabase
        .from("property_channels")
        .select(`
          commission_override_charge,
          channel:distribution_channels(name)
        `)
        .eq("property_id", formData.property_id)
        .eq("channel.name", formData.booking_source)
        .single()

      if (propertyChannel?.commission_override_charge && formData.base_amount > 0) {
        return formData.base_amount * (propertyChannel.commission_override_charge / 100)
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{booking ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle>
        <DialogDescription>{booking ? "Modifica los datos de la reserva" : "Crea una nueva reserva"}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Primera fila: Información del Huésped + Detalles de la Reserva */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sección Izquierda: Información del Huésped */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Huésped</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest_name" className="text-sm font-medium text-gray-700">Nombre completo *</Label>
                  {/* GuestPicker: autocompletar desde people */}
                  <GuestPicker
                    value={{ name: formData.guest_name, email: formData.guest_email || '', phone: formData.guest_phone || '', personId: (formData as any).person_id || (formData as any)._picked_person?.id }}
                    onChange={(val, picked) => {
                      setFormData(prev => ({
                        ...prev,
                        guest_name: val.name,
                        guest_email: val.email || '',
                        guest_phone: val.phone || '',
                        person_id: val.personId || (prev as any).person_id,
                      }) as any)
                      if (picked) {
                        ;(formData as any)._picked_person = picked
                      } else {
                        // Si el usuario está tecleando y no selecciona, no mantengamos un picked anterior
                        delete (formData as any)._picked_person
                      }
                    }}
                  />
                </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest_email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={formData.guest_email}
                  onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                  placeholder="Ej: juan.perez@example.com"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest_phone" className="text-sm font-medium text-gray-700">Teléfono *</Label>
                <Input
                  id="guest_phone"
                  value={formData.guest_phone}
                  onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                  placeholder="Ej: +34 600 123 456"
                  required
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest_country" className="text-sm font-medium text-gray-700">País</Label>
                <Input
                  id="guest_country"
                  value={formData.guest_country}
                  onChange={(e) => setFormData({ ...formData, guest_country: e.target.value })}
                  placeholder="Ej: España"
                  className="h-10"
                />
              </div>
            </div>
          </div>
          
          {/* Sección Derecha: Detalles de la Reserva */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Reserva</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property_id" className="text-sm font-medium text-gray-700">Propiedad *</Label>
                <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                  <span className="text-gray-600 text-sm">
                    {booking 
                      ? properties.find(p => p.id === booking.property_id)?.name || "Propiedad no encontrada"
                      : selectedProperty?.name || "No hay propiedad seleccionada"
                    }
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in" className="text-sm font-medium text-gray-700">Check-in *</Label>
                  <Input
                    id="check_in"
                    type="date"
                    value={formData.check_in}
                    onChange={(e) => {
                      setFormData({ ...formData, check_in: e.target.value })
                      // Limpiar error cuando se cambia la fecha
                      if (dateError) setDateError("")
                    }}
                    required
                    className={`h-10 ${dateError ? 'border-red-500' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out" className="text-sm font-medium text-gray-700">Check-out *</Label>
                  <Input
                    id="check_out"
                    type="date"
                    value={formData.check_out}
                    min={formData.check_in || undefined}
                    onChange={(e) => {
                      setFormData({ ...formData, check_out: e.target.value })
                      // Limpiar error cuando se cambia la fecha
                      if (dateError) setDateError("")
                    }}
                    required
                    className={`h-10 ${dateError ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              
              {/* Mostrar error de validación de fechas */}
              {dateError && (
                <div className="text-red-500 text-sm mt-2">
                  {dateError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Número de noches</Label>
                <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                  <span className="text-gray-600 text-sm">
                    {formData.check_in && formData.check_out ? `${nightsCalculation.nights} noches` : "Se calculará automáticamente"}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guests_count" className="text-sm font-medium text-gray-700">Total huéspedes</Label>
                  <Input
                    id="guests_count"
                    type="number"
                    min="1"
                    value={formData.guests_count}
                    onChange={(e) => {
                      const total = Number.parseInt(e.target.value)
                      setFormData({ 
                        ...formData, 
                        guests_count: total,
                        adults: Math.min(formData.adults, total),
                        children: Math.max(0, total - formData.adults)
                      })
                    }}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-sm font-medium text-gray-700">Adultos</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    max={formData.guests_count}
                    value={formData.adults}
                    onChange={(e) => {
                      const adults = Number.parseInt(e.target.value)
                      const children = Math.max(0, formData.guests_count - adults)
                      setFormData({ 
                        ...formData, 
                        adults: adults,
                        children: children
                      })
                    }}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children" className="text-sm font-medium text-gray-700">Niños</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    max={formData.guests_count - 1}
                    value={formData.children}
                    onChange={(e) => {
                      const children = Number.parseInt(e.target.value)
                      const adults = Math.max(1, formData.guests_count - children)
                      setFormData({ 
                        ...formData, 
                        children: children,
                        adults: adults
                      })
                    }}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Segunda fila: Estado y Canal + Precios y Comisiones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sección Izquierda: Estado y Canal */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Canal</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="reserved">Reservada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_status" className="text-sm font-medium text-gray-700">Estado de pago</Label>
                {(() => {
                  // Usar el mismo cálculo unificado que en la tarjeta para evitar desajustes
                  const status = booking ? (() => {
                    const currentBooking = {
                      ...booking,
                      total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                      channel_commission: formData.channel_commission || 0,
                      collection_commission: formData.collection_commission || 0,
                      booking_source: formData.booking_source
                    }
                    const payments = reservationPayments?.[booking.id] || []
                    return calculatePaymentInfo(currentBooking, payments).paymentStatus
                  })() : 'pending'

                  return (
                    <div className="flex items-center space-x-2">
                      <Input
                        id="payment_status"
                        value={status}
                        readOnly
                        className="h-10 bg-gray-50 text-gray-700 cursor-not-allowed"
                        disabled
                      />
                      <Badge className={`${getPaymentStatusColor(status)} text-xs`}>
                        <div className="flex items-center space-x-1">
                          {getPaymentStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                      </Badge>
                    </div>
                  )
                })()}
                <div className="text-xs text-gray-500">
                  El estado del pago se calcula con los mismos importes que se muestran a la derecha
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="booking_source" className="text-sm font-medium text-gray-700">Canal</Label>
                <Select
                  value={formData.booking_source}
                  onValueChange={(value) => setFormData({ ...formData, booking_source: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecciona un canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const filteredChannels = availableChannels
                        .filter((channel) => {
                          const channelName = channel.channel?.name || '';
                          // Solo filtrar canales que realmente causan duplicación
                          return channelName !== 'Direct' && 
                                 channelName !== 'Canal Directo' &&
                                 channelName !== 'Directo';
                          // NOTA: NO filtrar 'Propio' porque es un canal válido
                        });
                      
                      return filteredChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.channel?.name || ''}>
                          {channel.channel?.name || ''}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="external_id" className="text-sm font-medium text-gray-700">
                  ID de reserva externa {formData.booking_source !== "Propio" ? "*" : ""}
                </Label>
                <Input
                  id="external_id"
                  value={formData.external_id || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, external_id: e.target.value })
                    // Limpiar error cuando se cambia el valor
                    if (externalIdError) setExternalIdError("")
                  }}
                  placeholder="Ej: AIR-123456"
                  className={`h-10 ${externalIdError ? 'border-red-500' : ''}`}
                  required={formData.booking_source !== "Propio"}
                />
                <div className="text-xs text-gray-500">
                  ID de la reserva en el canal de distribución externo
                  {formData.booking_source !== "Propio" && (
                    <span className="text-red-500 ml-1">(Obligatorio para canales externos)</span>
                  )}
                </div>
                {/* Mostrar error de validación del ID externo */}
                {externalIdError && (
                  <div className="text-red-500 text-sm mt-1">
                    {externalIdError}
                  </div>
                )}
              </div>
            </div>
          </div>
          
                          {/* Sección Derecha: Precios y Comisiones */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios y Comisiones</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base_amount" className="text-sm font-medium text-gray-700">Precio base</Label>
                        <Input
                          id="base_amount"
                          type="number"
                          step="0.01"
                          value={formData.base_amount || ""}
                          onChange={(e) => setFormData({ ...formData, base_amount: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cleaning_fee" className="text-sm font-medium text-gray-700">Tarifa de limpieza</Label>
                        <Input
                          id="cleaning_fee"
                          type="number"
                          step="0.01"
                          value={formData.cleaning_fee || ""}
                          onChange={(e) => setFormData({ ...formData, cleaning_fee: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </div>
                    </div>
                    
                    
                    <div className="space-y-2">
                      <Label htmlFor="channel_commission" className="text-sm font-medium text-gray-700">
                        Comisión Canal
                        {commissionPercentages.sale !== null && (
                          <span className="text-blue-600 ml-1">({commissionPercentages.sale}%)</span>
                        )}
                      </Label>
                      <Input
                        id="channel_commission"
                        type="number"
                        step="0.01"
                        value={formData.channel_commission || ""}
                        onChange={(e) => setFormData({ ...formData, channel_commission: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className={`h-10 ${commissionPercentages.sale !== null ? 'bg-blue-50 border-blue-200' : ''}`}
                        onFocus={() => {}}
                      />
                      {commissionPercentages.sale !== null && (
                        <div className="text-xs text-blue-600">
                          Calculado automáticamente: {formData.base_amount || 0} × {commissionPercentages.sale}% = €{Math.round(((formData.base_amount || 0) * commissionPercentages.sale / 100) * 100) / 100}
                          <span className="text-gray-500 ml-2">(Puedes modificar si es necesario)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="collection_commission" className="text-sm font-medium text-gray-700">
                        Comisión Cobro
                        {commissionPercentages.charge !== null && (
                          <span className="text-blue-600 ml-1">({commissionPercentages.charge}%)</span>
                        )}
                      </Label>
                      <Input
                        id="collection_commission"
                        type="number"
                        step="0.01"
                        value={formData.collection_commission || ""}
                        onChange={(e) => setFormData({ ...formData, collection_commission: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className={`h-10 ${commissionPercentages.charge !== null ? 'bg-blue-50 border-blue-200' : ''}`}
                        onFocus={() => {}}
                      />
                      {commissionPercentages.charge !== null && (
                        <div className="text-xs text-blue-600">
                          Calculado automáticamente: {formData.base_amount || 0} × {commissionPercentages.charge}% = €{Math.round(((formData.base_amount || 0) * commissionPercentages.charge / 100) * 100) / 100}
                          <span className="text-gray-500 ml-2">(Puedes modificar si es necesario)</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Campo Impuesto (IVA) */}
                    <div className="space-y-2">
                      <Label htmlFor="vat_info" className="text-sm font-medium text-gray-700">
                        Impuesto
                        {(() => {
                          const currentBooking = booking ? {
                            ...booking,
                            total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                            channel_commission: formData.channel_commission || 0,
                            collection_commission: formData.collection_commission || 0,
                            booking_source: formData.booking_source
                          } : {
                            id: '',
                            property_id: formData.property_id,
                            guest_id: 'guest-jsonb',
                            check_in: formData.check_in,
                            check_out: formData.check_out,
                            guests_count: formData.guests_count,
                            total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                            status: 'pending',
                            booking_source: formData.booking_source,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            channel_commission: formData.channel_commission || 0,
                            collection_commission: formData.collection_commission || 0,
                          } as any
                          
                          const { vatInfo } = calculatePaymentInfo(currentBooking, booking ? (reservationPayments?.[booking.id] || []) : [])
                          return vatInfo.applyVat ? (
                            <span className="text-blue-600 ml-1">({vatInfo.vatPercent}%)</span>
                          ) : (
                            <span className="text-gray-400 ml-1">(Sin IVA)</span>
                          )
                        })()}
                      </Label>
                      <Input
                        id="vat_info"
                        type="text"
                        value={(() => {
                          const currentBooking = booking ? {
                            ...booking,
                            total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                            channel_commission: formData.channel_commission || 0,
                            collection_commission: formData.collection_commission || 0,
                            booking_source: formData.booking_source
                          } : {
                            id: '',
                            property_id: formData.property_id,
                            guest_id: 'guest-jsonb',
                            check_in: formData.check_in,
                            check_out: formData.check_out,
                            guests_count: formData.guests_count,
                            total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                            status: 'pending',
                            booking_source: formData.booking_source,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            channel_commission: formData.channel_commission || 0,
                            collection_commission: formData.collection_commission || 0,
                          } as any
                          
                          const { vatInfo } = calculatePaymentInfo(currentBooking, booking ? (reservationPayments?.[booking.id] || []) : [])
                          return vatInfo.vatAmount.toFixed(2)
                        })()}
                        readOnly
                        className="bg-blue-50 border-blue-200"
                        onFocus={() => {}}
                      />
                      <div className="text-xs text-blue-600">
                        {(() => {
                          const currentBooking = booking ? {
                            ...booking,
                            total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                            channel_commission: formData.channel_commission || 0,
                            collection_commission: formData.collection_commission || 0,
                            booking_source: formData.booking_source
                          } : {
                            id: '',
                            property_id: formData.property_id,
                            guest_id: 'guest-jsonb',
                            check_in: formData.check_in,
                            check_out: formData.check_out,
                            guests_count: formData.guests_count,
                            total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                            status: 'pending',
                            booking_source: formData.booking_source,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            channel_commission: formData.channel_commission || 0,
                            collection_commission: formData.collection_commission || 0,
                          } as any
                          
                          const { vatInfo } = calculatePaymentInfo(currentBooking, booking ? (reservationPayments?.[booking.id] || []) : [])
                          const totalCommissions = (formData.channel_commission || 0) + (formData.collection_commission || 0)
                          
                          if (!vatInfo.applyVat) {
                            return "Sin IVA aplicado para este canal"
                          }
                          
                          return `Calculado automáticamente: ${totalCommissions.toFixed(2)} × ${vatInfo.vatPercent}% = €${vatInfo.vatAmount.toFixed(2)}`
                        })()}
                        <span className="text-gray-500 ml-2">(Aplicado sobre comisiones)</span>
                      </div>
                    </div>
                    
                    {/* Sección de Total, Importe pagado e Importe pendiente - SIEMPRE VISIBLE */}
                    <div className="grid grid-cols-3 gap-6 mt-4 p-4 bg-gray-50 rounded-lg">
                      {/* Importe requerido (alineado en dos líneas) */}
                      <div className="flex flex-col items-start gap-1">
                        <div className="text-left flex flex-col">
                          <div className="text-sm font-medium text-gray-700 whitespace-nowrap leading-tight">Importe</div>
                          <div className="text-xs text-gray-500 leading-tight">requerido</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 text-left tabular-nums whitespace-nowrap leading-none">
                          {booking ? (() => {
                            const currentBooking = {
                              ...booking,
                              total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                              channel_commission: formData.channel_commission || 0,
                              collection_commission: formData.collection_commission || 0,
                              booking_source: formData.booking_source
                            }
                            const { requiredAmount } = calculatePaymentInfo(currentBooking, reservationPayments?.[booking.id] || [])
                            return formatCurrency(requiredAmount)
                          })() : (() => {
                            const currentBooking = {
                              id: '',
                              property_id: formData.property_id,
                              guest_id: 'guest-jsonb',
                              check_in: formData.check_in,
                              check_out: formData.check_out,
                              guests_count: formData.guests_count,
                              total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                              status: 'pending',
                              booking_source: formData.booking_source,
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString(),
                              channel_commission: formData.channel_commission || 0,
                              collection_commission: formData.collection_commission || 0,
                            } as any
                            const { requiredAmount } = calculatePaymentInfo(currentBooking, [])
                            return formatCurrency(requiredAmount)
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">(Tras comisiones)</div>
                      </div>
                      
                      {/* Importe pagado */}
                      <div className="flex flex-col items-start gap-1">
                        <div className="text-left flex flex-col">
                          <Label className="text-sm font-medium text-gray-700 block whitespace-nowrap leading-tight">Importe</Label>
                          <div className="text-xs text-gray-500 leading-tight">pagado</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600 text-left tabular-nums whitespace-nowrap leading-none">
                          {booking ? (() => {
                            const currentBooking = {
                              ...booking,
                              total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                              channel_commission: formData.channel_commission || 0,
                              collection_commission: formData.collection_commission || 0,
                              booking_source: formData.booking_source
                            }
                            const { totalPayments } = calculatePaymentInfo(currentBooking, reservationPayments?.[booking.id] || [])
                            return formatCurrency(totalPayments)
                          })() : formatCurrency(0)}
                        </div>
                      </div>
                      
                      {/* Importe pendiente */}
                      <div className="flex flex-col items-start gap-1">
                        <div className="text-left flex flex-col">
                          <Label className="text-sm font-medium text-gray-700 block whitespace-nowrap leading-tight">Importe</Label>
                          <div className="text-xs text-gray-500 leading-tight">pendiente</div>
                        </div>
                        <div className="text-2xl font-bold text-orange-600 text-left tabular-nums whitespace-nowrap leading-none">
                          {booking ? (() => {
                            const currentBooking = {
                              ...booking,
                              total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                              channel_commission: formData.channel_commission || 0,
                              collection_commission: formData.collection_commission || 0,
                              booking_source: formData.booking_source
                            }
                            const { pendingAmount } = calculatePaymentInfo(currentBooking, reservationPayments?.[booking.id] || [])
                            return formatCurrency(pendingAmount)
                          })() : (() => {
                            // Calcular pendiente en ALTA igual que en edición: requerido - pagado (0)
                            const currentBooking = {
                              id: '',
                              property_id: formData.property_id,
                              guest_id: 'guest-jsonb',
                              check_in: formData.check_in,
                              check_out: formData.check_out,
                              guests_count: formData.guests_count,
                              total_amount: (formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0),
                              status: 'pending',
                              booking_source: formData.booking_source,
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString(),
                              channel_commission: formData.channel_commission || 0,
                              collection_commission: formData.collection_commission || 0,
                            } as any
                            const { pendingAmount } = calculatePaymentInfo(currentBooking, [])
                            return formatCurrency(pendingAmount)
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
        </div>
        

        
        {/* Tercera fila: Notas y Solicitudes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas y Solicitudes</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notas</Label>
              <textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotaciones sobre la reserva..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special_requests" className="text-sm font-medium text-gray-700">Solicitudes especiales</Label>
              <textarea
                id="special_requests"
                value={formData.special_requests || ""}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                placeholder="Solicitudes especiales del huésped..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>





        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Cancelar
          </Button>
          <Button type="submit" disabled={calculatingCommissions} variant="default">
            {calculatingCommissions ? "Calculando..." : (booking ? "Actualizar" : "Crear")} Reserva
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
