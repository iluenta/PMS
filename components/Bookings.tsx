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
  calculateBookingFinancials
} from "@/lib/supabase"
import { getPropertyChannels } from "@/lib/channels"
import type { PropertyChannelWithDetails } from "@/types/channels"
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
  DollarSign
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
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("pending")
  const [sortFilter, setSortFilter] = useState<string>("checkin_asc")

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
            channel:distribution_channels(*)
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
          // Debug: Log the reservation data to understand the structure
          console.log("🔍 Processing reservation:", {
            id: reservation.id,
            property_channels: reservation.property_channels,
            channel: reservation.property_channels?.channel,
            external_source: reservation.external_source,
            external_id: reservation.external_id
          })
          
          // Determine booking_source with better logic
          let bookingSource = 'Direct' // Default
          if (reservation.property_channels?.channel?.name) {
            bookingSource = reservation.property_channels.channel.name
          } else if (reservation.external_source) {
            bookingSource = reservation.external_source
          }
          
          console.log("🔍 Determined booking_source:", bookingSource)
          
          return {
            ...reservation,
            guest_id: 'guest-jsonb', // Since guest is JSONB, we use a placeholder
            guests_count: reservation.guests || reservation.adults + reservation.children || 1,
            booking_source: bookingSource,
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión Venta</span>
                        <span className="text-orange-600">€{(booking.channel_commission || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión Cobro</span>
                        <span className="text-red-600">€{(booking.collection_commission || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</span>
                      </div>
                      {booking.net_amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Neto</span>
                          <span className="text-green-600">€{(booking.net_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Solicitudes Especiales y Notas */}
                {(booking.special_requests || booking.notes) && (
                  <div className="border-t pt-3 space-y-2">
                    {booking.special_requests && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Solicitudes Especiales</p>
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs text-gray-800 whitespace-pre-wrap">{booking.special_requests}</p>
                        </div>
                      </div>
                    )}
                    
                    {booking.notes && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Notas</p>
                        <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-xs text-gray-800 whitespace-pre-wrap">{booking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
  
  const [availableChannels, setAvailableChannels] = useState<PropertyChannelWithDetails[]>([])
  const [calculatingCommissions, setCalculatingCommissions] = useState(false)
  const [dateError, setDateError] = useState<string>("")
  const [externalIdError, setExternalIdError] = useState<string>("")
  const [propertyError, setPropertyError] = useState<string>("")
  const [commissionPercentages, setCommissionPercentages] = useState<{
    sale: number | null;
    charge: number | null;
  }>({ sale: null, charge: null })

  // Funciones para el estado del pago
  const getPaymentStatusColor = (status: string) => {
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
  }

  const getPaymentStatusIcon = (status: string) => {
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
  }

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
      console.log("🎯 Setting form data for editing:", {
        booking_source: formDataToSet.booking_source,
        booking: booking
      })
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
  // Only recalculate if we're creating a new booking (not editing) and using old commission system
  useEffect(() => {
    if (formData.property_id && formData.booking_source && !booking && formData.booking_source === "Propio") {
      calculateCommissions()
    }
  }, [formData.property_id, formData.booking_source, formData.base_amount, booking])

  // Recalcular comisiones cuando cambie el precio base y haya porcentajes configurados
  // Solo para nuevas reservas, no para edición
  useEffect(() => {
    if (formData.booking_source !== "Propio" && commissionPercentages.sale !== null && commissionPercentages.charge !== null && !booking) {
      const baseAmount = formData.base_amount || 0
      const saleCommission = commissionPercentages.sale ? 
        Math.round((baseAmount * commissionPercentages.sale / 100) * 100) / 100 : 0
      const chargeCommission = commissionPercentages.charge ? 
        Math.round((baseAmount * commissionPercentages.charge / 100) * 100) / 100 : 0

      setFormData(prev => ({
        ...prev,
        channel_commission: saleCommission,
        collection_commission: chargeCommission
      }))
    }
  }, [formData.base_amount, commissionPercentages, booking])

  const loadPropertyChannels = async (propertyId: string) => {
    try {
      console.log("🔄 Loading property channels for property:", propertyId)
      const channels = await getPropertyChannels(propertyId)
      console.log("📋 Available channels loaded:", channels)
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

    // Validar que se haya seleccionado una propiedad (PRIMERO - orden de campos en pantalla)
    if (!formData.property_id) {
      setPropertyError("Completa este campo")
      return
    } else {
      setPropertyError("")
    }

    // Validar fechas después de validar propiedad
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
      console.log("🔍 Looking for property_channel_id for:", {
        property_id: formData.property_id,
        booking_source: formData.booking_source
      })
      
      try {
        // First, get all property channels for this property
        const { data: allChannels, error: channelsError } = await supabase
          .from("property_channels")
          .select("id, distribution_channels(name)")
          .eq("property_id", formData.property_id)
        
        console.log("📋 All property channels found:", allChannels)
        console.log("📋 Channels error:", channelsError)
        
        if (channelsError) {
          console.error("❌ Error fetching property_channels:", channelsError)
          // If RLS error, try to create the channel anyway
          if (channelsError.code === 'PGRST116') {
            console.log("🔧 RLS error detected, attempting to create channel...")
          } else {
            property_channel_id = null
          }
        }
        
                  // For "Direct" bookings, look for "Propio" channel
          const channelNameToFind = formData.booking_source === "Direct" ? "Propio" : formData.booking_source
        console.log("🔍 Looking for channel name:", channelNameToFind)
        
        // Find the channel that matches the booking_source
        const matchingChannel = allChannels?.find(channel => 
          (channel.distribution_channels as any)?.name === channelNameToFind
        )
        
        console.log("🔍 Matching channel found:", matchingChannel)
        console.log("🔍 All channels for debugging:", allChannels?.map(c => ({
          id: c.id,
          name: (c.distribution_channels as any)?.name
        })))
        
        if (matchingChannel) {
          property_channel_id = matchingChannel.id
          console.log("✅ Found matching property_channel_id:", property_channel_id, "for channel:", channelNameToFind)
        } else {
                      // If no matching channel found and it's "Direct", create one
            if (formData.booking_source === "Direct") {
              console.log("🔧 Creating Propio channel for property:", formData.property_id)
              
              // First, get the "Propio" distribution channel
              const { data: propioChannel, error: propioError } = await supabase
                .from("distribution_channels")
                .select("id")
                .eq("name", "Propio")
                .single()
              
              console.log("🔍 Propio distribution channel query result:", { propioChannel, propioError })
              
              if (propioError) {
                console.error("❌ Error fetching Propio distribution channel:", propioError)
                property_channel_id = null
              } else if (propioChannel) {
                console.log("✅ Found Propio distribution channel:", propioChannel)
                
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
                
                console.log("🔍 Property channel creation result:", { newPropertyChannel, createError })
                
                if (createError) {
                  console.error("❌ Error creating property_channel for Propio:", createError)
                  console.error("🔍 Create error details:", {
                    message: createError.message,
                    details: createError.details,
                    hint: createError.hint,
                    code: createError.code
                  })
                  property_channel_id = null
                } else {
                  property_channel_id = newPropertyChannel.id
                  console.log("✅ Created property_channel_id for Propio:", property_channel_id)
                }
              } else {
                console.error("❌ Propio distribution channel not found")
                property_channel_id = null
              }
          } else {
            console.error("❌ No matching channel found for:", formData.booking_source)
            console.log("📋 Available channels:", allChannels?.map(c => (c.distribution_channels as any)?.name))
            property_channel_id = null
          }
        }
      } catch (error) {
        console.error("❌ Exception in property_channel query:", error)
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
        external_id: formData.external_id || null
      }

      // Ensure we have a valid property_channel_id
      if (!property_channel_id) {
        console.error("❌ No valid property_channel_id found for booking_source:", formData.booking_source)
        alert("Error: No se pudo encontrar o crear el canal de distribución. Por favor, verifica la configuración del canal.")
        return
      }

      console.log("📤 Submitting reservation data:", submitData)

      if (booking) {
        const { error } = await supabase
          .from("reservations")
          .update(submitData)
          .eq("id", booking.id)
        
        if (error) {
          console.error("❌ Error updating reservation:", error)
          console.error("📊 Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          // Crear un error más descriptivo
          const errorMessage = error.message || "Error desconocido al actualizar la reserva"
          const enhancedError = new Error(`Error updating reservation: ${errorMessage}`)
          enhancedError.cause = error
          throw enhancedError
        }
        console.log("✅ Reservation updated successfully")
      } else {
        const { error } = await supabase
          .from("reservations")
          .insert([submitData])
        
        if (error) {
          console.error("❌ Error creating reservation:", error)
          console.error("📊 Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          // Crear un error más descriptivo
          const errorMessage = error.message || "Error desconocido al crear la reserva"
          const enhancedError = new Error(`Error creating reservation: ${errorMessage}`)
          enhancedError.cause = error
          throw enhancedError
        }
        console.log("✅ Reservation created successfully")
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("💥 Error saving reservation:", error)
      
      let errorMessage = "Error desconocido al guardar la reserva"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Intentar extraer información del objeto de error
        const errorObj = error as any
        errorMessage = errorObj.message || errorObj.details || errorObj.hint || JSON.stringify(errorObj)
      }
      
      console.error("📋 Full error object:", error)
      alert(`Error al guardar la reserva: ${errorMessage}`)
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
  // Solo para nuevas reservas, no para edición
  useEffect(() => {
    if (formData.property_id && formData.booking_source && formData.booking_source !== "Direct" && !booking) {
      loadCommissionPercentages()
    } else if (formData.booking_source === "Direct" || booking) {
      setCommissionPercentages({ sale: null, charge: null })
    }
  }, [formData.property_id, formData.booking_source, booking])

  const loadCommissionPercentages = async () => {
    try {
      console.log("🔍 Loading commission percentages for:", {
        property_id: formData.property_id,
        booking_source: formData.booking_source
      })

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
        console.error("❌ Error fetching property_channels:", channelsError)
        setCommissionPercentages({ sale: null, charge: null })
        return
      }

      console.log("📋 All channels for property:", allChannels)

      // Buscar el canal que coincida con el booking_source
      const matchingChannel = allChannels?.find(channel => 
        (channel.distribution_channels as any)?.name === formData.booking_source
      )

      console.log("🎯 Matching channel:", matchingChannel)

      if (matchingChannel) {
        setCommissionPercentages({
          sale: matchingChannel.commission_override_sale,
          charge: matchingChannel.commission_override_charge
        })
        
        // Calcular y aplicar las comisiones automáticamente
        const baseAmount = formData.base_amount || 0
        const saleCommission = matchingChannel.commission_override_sale ? 
          Math.round((baseAmount * matchingChannel.commission_override_sale / 100) * 100) / 100 : 0
        const chargeCommission = matchingChannel.commission_override_charge ? 
          Math.round((baseAmount * matchingChannel.commission_override_charge / 100) * 100) / 100 : 0

        console.log("💰 Calculated commissions:", {
          baseAmount,
          saleCommission,
          chargeCommission,
          salePercentage: matchingChannel.commission_override_sale,
          chargePercentage: matchingChannel.commission_override_charge
        })

        setFormData(prev => {
          console.log("🔄 Updating formData with commissions:", {
            previous: { channel_commission: prev.channel_commission, collection_commission: prev.collection_commission },
            new: { channel_commission: saleCommission, collection_commission: chargeCommission }
          })
          return {
            ...prev,
            channel_commission: saleCommission,
            collection_commission: chargeCommission
          }
        })
      } else {
        console.log("❌ No matching channel found for:", formData.booking_source)
        setCommissionPercentages({ sale: null, charge: null })
      }
    } catch (error) {
      console.error("❌ Error in loadCommissionPercentages:", error)
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

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Primera fila: Información del Huésped + Detalles de la Reserva */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sección Izquierda: Información del Huésped */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Huésped</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name" className="text-sm font-medium text-gray-700">Nombre completo *</Label>
                <Input
                  id="guest_name"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                  className="h-10"
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
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, property_id: value })
                    // Limpiar error cuando se selecciona una propiedad
                    if (propertyError) setPropertyError("")
                  }}
                >
                  <SelectTrigger className={`h-10 ${propertyError ? 'border-red-500' : ''}`}>
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
                {/* Mostrar error de validación de propiedad */}
                {propertyError && (
                  <div className="relative">
                    <div className="absolute top-full left-0 mt-1 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <span className="text-gray-700 text-sm">{propertyError}</span>
                      </div>
                      <div className="absolute top-0 left-4 transform -translate-y-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    </div>
                  </div>
                )}
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_status" className="text-sm font-medium text-gray-700">Estado de pago</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="payment_status"
                    value={formData.payment_status || "pending"}
                    readOnly
                    className="h-10 bg-gray-50 text-gray-700 cursor-not-allowed"
                    disabled
                  />
                  <Badge className={`${getPaymentStatusColor(formData.payment_status || "pending")} text-xs`}>
                    <div className="flex items-center space-x-1">
                      {getPaymentStatusIcon(formData.payment_status || "pending")}
                      <span className="capitalize">{formData.payment_status || "pending"}</span>
                    </div>
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  El estado del pago se actualiza automáticamente según los pagos registrados
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
                      
                      console.log("🎯 Filtered channels for select:", filteredChannels.map(c => c.channel?.name));
                      
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
                      <Label htmlFor="taxes" className="text-sm font-medium text-gray-700">Impuestos</Label>
                      <Input
                        id="taxes"
                        type="number"
                        step="0.01"
                        value={formData.taxes || ""}
                        onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="h-10"
                      />
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
                        onFocus={() => console.log("🔍 Channel commission field value:", formData.channel_commission)}
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
                        onFocus={() => console.log("🔍 Collection commission field value:", formData.collection_commission)}
                      />
                      {commissionPercentages.charge !== null && (
                        <div className="text-xs text-blue-600">
                          Calculado automáticamente: {formData.base_amount || 0} × {commissionPercentages.charge}% = €{Math.round(((formData.base_amount || 0) * commissionPercentages.charge / 100) * 100) / 100}
                          <span className="text-gray-500 ml-2">(Puedes modificar si es necesario)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Total (sin comisiones)</Label>
                      <div className="text-2xl font-bold text-gray-900">
                        €{((formData.base_amount || 0) + (formData.taxes || 0) + (formData.cleaning_fee || 0)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
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

