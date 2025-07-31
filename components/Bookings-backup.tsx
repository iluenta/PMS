"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
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
  calculateBookingFinancials,
  getPropertyChannels
} from "@/lib/supabase"
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
  Trash2
} from "lucide-react"

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [propertyFilter, setPropertyFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [sortFilter, setSortFilter] = useState<string>("newest")

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

    // Property filter
    if (propertyFilter !== "all") {
      filtered = filtered.filter((booking) => booking.property_id === propertyFilter)
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
  }, [bookings, searchTerm, statusFilter, propertyFilter, channelFilter, dateRangeFilter, sortFilter])

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
    
    // Calculate real revenue (excluding cancelled bookings)
    const realRevenue = filteredBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
    
    // Calculate lost revenue from cancelled bookings
    const lostRevenue = filteredBookings
      .filter(b => b.status === 'cancelled')
      .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)

    return {
      total,
      confirmed,
      cancelled,
      revenue: realRevenue,
      lostRevenue: lostRevenue
    }
  }, [filteredBookings])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching reservations data...")
      
      // Fetch reservations data with property_channel information
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          *,
          property_channels!reservations_property_channel_fkey(
            *,
            distribution_channels(*)
          )
        `)
        .order("created_at", { ascending: false })

      console.log("📊 Reservations data:", reservationsData)
      console.log("❌ Reservations error:", reservationsError)

      // Fetch properties for the form
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")

      console.log("🏠 Properties data:", propertiesData)
      console.log("❌ Properties error:", propertiesError)

            if (reservationsData) {
        // Transform reservations data to match our Booking interface
        const transformedReservations = reservationsData.map((reservation) => {
          return {
            ...reservation,
            guest_id: 'guest-jsonb', // Since guest is JSONB, we use a placeholder
            guests_count: reservation.guests || reservation.adults + reservation.children || 1,
            booking_source: reservation.property_channels?.distribution_channels?.name || reservation.external_source || 'Direct',
            external_id: reservation.external_id || null,
            // Ensure commission fields are properly included
            channel_commission: reservation.channel_commission || 0,
            collection_commission: reservation.collection_commission || 0,
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
      // No longer fetch guests since we don't use that table
      setGuests([]) // Set empty array since we handle guest data differently

      // If no data exists, show information about it
      if (!reservationsData || reservationsData.length === 0) {
        console.log("ℹ️ No reservations found in database")
      }
      if (!propertiesData || propertiesData.length === 0) {
        console.log("ℹ️ No properties found in database")
      }

    } catch (error) {
      console.error("💥 Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
      default:
        return <Clock className="h-4 w-4" />
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
          console.error("❌ Error deleting reservation:", error)
          alert(`Error al eliminar la reserva: ${error.message}`)
        } else {
          console.log("✅ Reservation deleted successfully")
          fetchData() // Refresh the list
        }
      } catch (error) {
        console.error("💥 Error deleting reservation:", error)
        alert("Error desconocido al eliminar la reserva.")
      }
    }
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <BookingDialog
            booking={editingBooking}
            properties={properties}
            guests={guests}
            onClose={() => setIsDialogOpen(false)}
            onSave={fetchData}
          />
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
              </SelectContent>
            </Select>
          </div>

          {/* Propiedad */}
          <div className="space-y-2">
            <Label htmlFor="property">Propiedad</Label>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las propiedades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las propiedades</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
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
                <SelectValue placeholder="Todas las fechas" />
              </SelectTrigger>
              <SelectContent>
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
                <SelectValue placeholder="Más antiguas primero" />
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
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              €{statistics.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Promedio: €{statistics.total > 0 ? (statistics.revenue / (statistics.total - statistics.cancelled)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }) : '0,00'} por reserva
              </p>
              {statistics.lostRevenue > 0 && (
                <Badge variant="secondary" className="bg-red-500 text-white hover:bg-red-500 text-xs">
                  -€{statistics.lostRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(booking.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {booking.guest?.first_name} {booking.guest?.last_name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Building2 className="h-4 w-4 mr-1" />
                    <span>{booking.property?.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>{booking.booking_source}</p>
                    {(booking as any).external_id && (
                      <p className="text-xs text-blue-600">ID: {(booking as any).external_id}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Check-in</p>
                    <p className="text-gray-600">
                      {new Date(booking.check_in).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Check-out</p>
                    <p className="text-gray-600">
                      {new Date(booking.check_out).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-gray-700">Duración</p>
                  <p className="text-gray-600">{calculateNights(booking.check_in, booking.check_out)} noches</p>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-lg font-semibold text-green-600">
                      €{(booking.total_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                    </span>
                  </div>
                  
                  {(booking.commission_amount || booking.channel_commission || booking.collection_commission || booking.net_amount) && (
                    <div className="mt-2 space-y-1 text-sm">
                      {booking.commission_amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comisión</span>
                          <span className="text-orange-600">
                            €{(booking.commission_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })} 
                            {booking.commission_rate && ` (${booking.commission_rate}%)`}
                          </span>
                        </div>
                      )}
                      {booking.channel_commission && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comisión Venta</span>
                          <span className="text-orange-600">€{(booking.channel_commission || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</span>
                        </div>
                      )}
                      {booking.collection_commission && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comisión Cobro</span>
                          <span className="text-red-600">€{(booking.collection_commission || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</span>
                        </div>
                      )}
                      {booking.net_amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Neto</span>
                          <span className="text-green-600">€{(booking.net_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-500 mb-4">Las reservas aparecerán aquí cuando las recibas</p>
            <Button onClick={handleAdd}>
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
}: {
  booking: Booking | null
  properties: Property[]
  guests: Guest[]
  onClose: () => void
  onSave: () => void
}) {
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
  
  const [availableChannels, setAvailableChannels] = useState<Array<{id: string, name: string}>>([])
  const [calculatingCommissions, setCalculatingCommissions] = useState(false)

  useEffect(() => {
    if (booking) {

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
      setFormData({
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
    }
  }, [booking])

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

  // Recalculate commissions when property, channel, or base_amount changes
  // Only recalculate if we're creating a new booking (not editing)
  useEffect(() => {
    if (formData.property_id && formData.booking_source && !booking) {
      calculateCommissions()
    }
  }, [formData.property_id, formData.booking_source, formData.base_amount, booking])

  const loadPropertyChannels = async (propertyId: string) => {
    try {
      const channels = await getPropertyChannels(propertyId)
      setAvailableChannels(channels)
    } catch (error) {
      console.error("Error loading channels:", error)
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
      console.error("Error calculating commissions:", error)
    } finally {
      setCalculatingCommissions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
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
      const nights = calculateNights()

      // Get property_channel ID from channel name and property
      const { data: channelData } = await supabase
        .from("property_channels")
        .select("id")
        .eq("property_id", formData.property_id)
        .eq("distribution_channels.name", formData.booking_source)
        .single()

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
        property_channel_id: channelData?.id || null,
        notes: formData.notes,
        special_requests: formData.special_requests,
        channel_commission: formData.channel_commission,
        collection_commission: formData.collection_commission,
        external_source: formData.booking_source,
        external_id: formData.external_id || null
      }

      console.log("📤 Submitting reservation data:", submitData)

      if (booking) {
        const { error } = await supabase
          .from("reservations")
          .update(submitData)
          .eq("id", booking.id)
        
        if (error) {
          console.error("❌ Error updating reservation:", error)
          throw error
        }
        console.log("✅ Reservation updated successfully")
      } else {
        const { error } = await supabase
          .from("reservations")
          .insert([submitData])
        
        if (error) {
          console.error("❌ Error creating reservation:", error)
          throw error
        }
        console.log("✅ Reservation created successfully")
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("💥 Error saving reservation:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al guardar la reserva: ${errorMessage}`)
    }
  }

  const calculateNights = () => {
    if (!formData.check_in || !formData.check_out) return 0
    const start = new Date(formData.check_in)
    const end = new Date(formData.check_out)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotalAmount = () => {
    return formData.base_amount + formData.taxes + formData.cleaning_fee
  }

  const calculateChannelCommission = async () => {
    if (!formData.property_id || !formData.booking_source) return 0

    try {
      const { data: propertyChannel } = await supabase
        .from("property_channels")
        .select("commission_override_sale")
        .eq("property_id", formData.property_id)
        .eq("distribution_channels.name", formData.booking_source)
        .single()

      if (propertyChannel?.commission_override_sale && formData.base_amount > 0) {
        return formData.base_amount * (propertyChannel.commission_override_sale / 100)
      }
      return 0
    } catch (error) {
      console.error("Error calculating channel commission:", error)
      return 0
    }
  }

  const calculateCollectionCommission = async () => {
    if (!formData.property_id || !formData.booking_source) return 0

    try {
      const { data: propertyChannel } = await supabase
        .from("property_channels")
        .select("commission_override_charge")
        .eq("property_id", formData.property_id)
        .eq("distribution_channels.name", formData.booking_source)
        .single()

      if (propertyChannel?.commission_override_charge && formData.base_amount > 0) {
        return formData.base_amount * (propertyChannel.commission_override_charge / 100)
      }
      return 0
    } catch (error) {
      console.error("Error calculating collection commission:", error)
      return 0
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{booking ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle>
        <DialogDescription>{booking ? "Modifica los datos de la reserva" : "Crea una nueva reserva"}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property and Guest Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property_id">Propiedad *</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) => setFormData({ ...formData, property_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_name">Nombre del Huésped *</Label>
            <Input
              id="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guest_email">Email del Huésped</Label>
            <Input
              id="guest_email"
              type="email"
              value={formData.guest_email}
              onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
              placeholder="Ej: juan.perez@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_phone">Teléfono del Huésped</Label>
            <Input
              id="guest_phone"
              value={formData.guest_phone}
              onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
              placeholder="Ej: +34 600 123 456"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guest_country">País del Huésped</Label>
            <Input
              id="guest_country"
              value={formData.guest_country}
              onChange={(e) => setFormData({ ...formData, guest_country: e.target.value })}
              placeholder="Ej: España"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_document_type">Tipo de Documento</Label>
            <Select
              value={formData.guest_document_type}
              onValueChange={(value) => setFormData({ ...formData, guest_document_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DNI">DNI</SelectItem>
                <SelectItem value="NIE">NIE</SelectItem>
                <SelectItem value="Passport">Pasaporte</SelectItem>
                <SelectItem value="Other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guest_document_number">Número de Documento</Label>
            <Input
              id="guest_document_number"
              value={formData.guest_document_number}
              onChange={(e) => setFormData({ ...formData, guest_document_number: e.target.value })}
              placeholder="Ej: 12345678Z"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guests_count">Total Huéspedes</Label>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adults">Adultos</Label>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children">Niños</Label>
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
            />
          </div>
        </div>

        {/* Dates and Check-in/out */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="check_in">Check-in *</Label>
            <Input
              id="check_in"
              type="date"
              value={formData.check_in}
              onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out">Check-out *</Label>
            <Input
              id="check_out"
              type="date"
              value={formData.check_out}
              onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Nights calculation display */}
        {formData.check_in && formData.check_out && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Duración:</span> {calculateNights()} noches
            </p>
          </div>
        )}

        {/* Channel and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="booking_source">Canal de reserva *</Label>
            <Select
              value={formData.booking_source}
              onValueChange={(value) => setFormData({ ...formData, booking_source: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un canal" />
              </SelectTrigger>
              <SelectContent>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.name}>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{channel.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* External ID for non-direct channels */}
        {formData.booking_source !== "Direct" && (
          <div className="space-y-2">
            <Label htmlFor="external_id">ID de Reserva Externa *</Label>
            <Input
              id="external_id"
              type="text"
              placeholder="Ej: 4689133542"
              value={formData.external_id}
              onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
              required
            />
            <p className="text-sm text-gray-500">
              ID de la reserva en el canal de distribución externo
            </p>
          </div>
        )}

        {/* Financial Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Información Financiera</h3>
            {calculatingCommissions && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          {/* Base Amount, Taxes, Cleaning Fee */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_amount">Importe Neto (€) *</Label>
              <Input
                id="base_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_amount}
                onChange={(e) => setFormData({ ...formData, base_amount: Number.parseFloat(e.target.value) || 0 })}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxes">Impuestos (€)</Label>
              <Input
                id="taxes"
                type="number"
                min="0"
                step="0.01"
                value={formData.taxes}
                onChange={(e) => setFormData({ ...formData, taxes: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaning_fee">Limpieza (€)</Label>
              <Input
                id="cleaning_fee"
                type="number"
                min="0"
                step="0.01"
                value={formData.cleaning_fee}
                onChange={(e) => setFormData({ ...formData, cleaning_fee: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Total Amount (Read-only) */}
          <div className="space-y-2">
            <Label className="text-blue-600">Total (€)</Label>
            <div className="h-10 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md flex items-center">
              <span className="text-lg font-semibold text-blue-600">
                €{formData.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
              </span>
            </div>
          </div>

          {/* Payment Status (Read-only) */}
          <div className="space-y-2">
            <Label className="text-gray-600">Estado del Pago</Label>
            <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
              <span className="font-medium text-gray-700 capitalize">
                {formData.payment_status}
              </span>
            </div>
          </div>

          {/* Commission breakdown */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label className="text-orange-600">Comisión Venta (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.channel_commission}
                onChange={(e) => setFormData({ ...formData, channel_commission: Number.parseFloat(e.target.value) || 0 })}
                className="bg-orange-50 border-orange-200"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-600">Comisión Cobro (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.collection_commission}
                onChange={(e) => setFormData({ ...formData, collection_commission: Number.parseFloat(e.target.value) || 0 })}
                className="bg-red-50 border-red-200"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="special_requests">Solicitudes especiales</Label>
          <Input
            id="special_requests"
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            placeholder="Solicitudes del huésped..."
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Anotaciones</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Anotaciones sobre la reserva..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={calculatingCommissions}>
            {calculatingCommissions ? "Calculando..." : (booking ? "Actualizar" : "Crear")} Reserva
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

