"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabase, type Booking, type Property } from "@/lib/supabase"
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  X, 
  User, 
  Euro,
  ArrowRight,
  ArrowLeft,
  Building
} from "lucide-react"

interface CalendarBooking {
  id: string
  guest_name: string
  check_in: Date
  check_out: Date
  property_name: string
  total_amount: number
  status: string
  booking: Booking
}

type DayStatus = 'available' | 'reserved' | 'closed' | 'warning'

interface DayInfo {
  date: Date
  status: DayStatus
  bookings: CalendarBooking[]
  price?: number
  guestName?: string
  isCheckIn?: boolean
  isCheckOut?: boolean
}

export default function Calendar() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date()) // Start with January 2025
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching calendar data from reservations...")
      
      // Fetch reservations data with property_channel information
      // Get reservations from 2024 to 2026 to ensure we have data for the current view
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          *,
          property_channels!reservations_property_channel_fkey(
            *,
            channel:distribution_channels(*)
          )
        `)
        .eq("status", "confirmed")
        .gte("check_in", "2024-01-01")
        .lte("check_out", "2026-12-31")
        .order("created_at", { ascending: false })

      console.log("📊 Reservations data:", reservationsData)
      console.log("❌ Reservations error:", reservationsError)

      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")

      console.log("✅ Properties fetched:", propertiesData?.length || 0)
      console.log("❌ Properties error:", propertiesError)

      if (reservationsData) {
        // Transform reservations data to match our Booking interface
        const transformedReservations = reservationsData.map((reservation) => {
          return {
            ...reservation,
            guest_id: 'guest-jsonb', // Since guest is JSONB, we use a placeholder
            guests_count: reservation.guests || reservation.adults + reservation.children || 1,
            booking_source: reservation.property_channels?.channel?.name || reservation.external_source || 'Direct',
            external_id: reservation.external_id || null,
            // Ensure commission fields are properly included
            channel_commission: reservation.channel_commission || 0,
            collection_commission: reservation.collection_commission || 0,
            // Transform the JSONB guest field to match expected structure
            property: propertiesData?.find(p => p.id === reservation.property_id) || null,
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
      
      if (propertiesData) {
        setProperties(propertiesData)
        // Auto-select the first property if available
        if (propertiesData.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(propertiesData[0].id)
        }
      }

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

  // Filter bookings by selected property
  const filteredBookings = useMemo(() => {
    if (!selectedPropertyId) return bookings
    return bookings.filter(booking => booking.property_id === selectedPropertyId)
  }, [bookings, selectedPropertyId])

  const calendarBookings = useMemo(() => {
    return filteredBookings.map((booking) => ({
      id: booking.id,
      guest_name: booking.guest?.first_name && booking.guest?.last_name 
        ? `${booking.guest.first_name} ${booking.guest.last_name}`
        : booking.guest?.first_name || booking.guest?.last_name || 'Sin nombre',
      check_in: new Date(booking.check_in),
      check_out: new Date(booking.check_out),
      property_name: booking.property?.name || 'Propiedad desconocida',
      total_amount: booking.total_amount || 0,
      status: booking.status || 'pending',
      booking: booking
    }))
  }, [filteredBookings])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Calculate the start of the calendar grid (Monday of the week containing the first day)
    const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Convert to Monday = 0
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - mondayOffset)

    const days = []
    const currentDate = new Date(startDate)

    // Fill the grid with 42 days (6 weeks * 7 days) to ensure we have enough cells
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const getBookingsForDate = (date: Date) => {
    return calendarBookings.filter((booking) => {
      const checkIn = new Date(booking.check_in)
      const checkOut = new Date(booking.check_out)
      const currentDate = new Date(date)
      
      return currentDate >= checkIn && currentDate < checkOut
    })
  }

  const getDayInfo = (date: Date): DayInfo => {
    const dayBookings = getBookingsForDate(date)
    const isToday = date.toDateString() === new Date().toDateString()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    
    // Check if it's a closed day (weekends or special dates)
    // You can customize this logic based on your business rules
    const isClosed = isWeekend || false // Example: weekends are closed
    
    if (dayBookings.length > 0) {
      const booking = dayBookings[0] // Take the first booking for this day
      const isCheckIn = booking.check_in.toDateString() === date.toDateString()
      const isCheckOut = booking.check_out.toDateString() === date.toDateString()
      
      return {
        date,
        status: 'reserved',
        bookings: dayBookings,
        price: booking.total_amount,
        guestName: booking.guest_name,
        isCheckIn,
        isCheckOut
      }
    }
    
    if (isClosed) {
      return {
        date,
        status: 'closed',
        bookings: []
      }
    }
    
    // Check for warning days - more specific logic
    const hasWarningConditions = (() => {
      // 1. Days with gaps between reservations (potential cleaning/maintenance needed)
      const hasGapAfterBooking = calendarBookings.some(booking => {
        const checkOut = new Date(booking.check_out)
        const currentDate = new Date(date)
        const daysAfterCheckout = Math.floor((currentDate.getTime() - checkOut.getTime()) / (1000 * 60 * 60 * 24))
        
        // Warning if it's 1-2 days after checkout (cleaning/maintenance period)
        return daysAfterCheckout >= 1 && daysAfterCheckout <= 2
      })
      
      // 2. Days before a new booking (preparation needed)
      const hasGapBeforeBooking = calendarBookings.some(booking => {
        const checkIn = new Date(booking.check_in)
        const currentDate = new Date(date)
        const daysBeforeCheckin = Math.floor((checkIn.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Warning if it's 1-2 days before checkin (preparation period)
        return daysBeforeCheckin >= 1 && daysBeforeCheckin <= 2
      })
      
      // 3. Days with low occupancy in high season
      const isHighSeason = currentDate.getMonth() >= 5 && currentDate.getMonth() <= 8 // June to September
      const hasLowOccupancy = dayBookings.length === 0 && isHighSeason
      
      return hasGapAfterBooking || hasGapBeforeBooking || hasLowOccupancy
    })()
    
    if (hasWarningConditions) {
      return {
        date,
        status: 'warning',
        bookings: []
      }
    }
    
    return {
      date,
      status: 'available',
      bookings: []
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const upcomingArrivals = useMemo(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return calendarBookings
      .filter((booking) => {
        const checkIn = new Date(booking.check_in)
        return checkIn >= today && checkIn <= nextWeek
      })
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
      .slice(0, 5)
  }, [calendarBookings])

  const upcomingDepartures = useMemo(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return calendarBookings
      .filter((booking) => {
        const checkOut = new Date(booking.check_out)
        return checkOut >= today && checkOut <= nextWeek
      })
      .sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime())
      .slice(0, 5)
  }, [calendarBookings])

  const getStatusIcon = (status: DayStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'reserved':
        return <User className="h-4 w-4 text-blue-600" />
      case 'closed':
        return <X className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: DayStatus) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'reserved':
        return 'Reservado'
      case 'closed':
        return 'Cerrado'
      case 'warning':
        return '¡Vaya!'
      default:
        return ''
    }
  }

  const getStatusColors = (status: DayStatus) => {
    switch (status) {
      case 'available':
        return 'bg-white border-gray-200'
      case 'reserved':
        return 'bg-blue-50 border-blue-200'
      case 'closed':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
        <p className="mt-2 text-gray-600">Vista general de las reservas por fecha</p>
      </div>

      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Seleccionar Propiedad
          </CardTitle>
          <CardDescription>
            Elige una propiedad para ver su calendario específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="property-select">Propiedad</Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-full md:w-80">
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
            {selectedProperty && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Propiedad seleccionada:</strong> {selectedProperty.name}
                {selectedProperty.address && (
                  <span className="block text-xs text-gray-500">
                    {selectedProperty.address}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      {selectedPropertyId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                {selectedProperty && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    - {selectedProperty.name}
                  </span>
                )}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2 h-32"></div>
                }

                const dayInfo = getDayInfo(date)
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={index}
                    className={`p-2 h-32 border rounded-lg ${getStatusColors(dayInfo.status)} ${
                      isToday ? "ring-2 ring-blue-500" : ""
                    } overflow-hidden relative`}
                  >
                    {/* Day number */}
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {date.getDate()}
                    </div>

                    {/* Price indicator */}
                    {dayInfo.price && (
                      <div className="absolute top-1 right-1">
                        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-1 py-0.5 rounded text-xs font-medium text-gray-700">
                          <Euro className="h-3 w-3" />
                          <span>€{dayInfo.price}</span>
                        </div>
                      </div>
                    )}

                    {/* Status indicator */}
                    <div className="flex items-center space-x-1 mb-1">
                      {getStatusIcon(dayInfo.status)}
                      <span className="text-xs font-medium text-gray-700">
                        {getStatusText(dayInfo.status)}
                      </span>
                    </div>

                    {/* Guest information */}
                    {dayInfo.guestName && (
                      <div className="text-xs text-gray-600 mb-1 truncate">
                        {dayInfo.guestName}
                      </div>
                    )}

                    {/* Check-in/Check-out indicators */}
                    {(dayInfo.isCheckIn || dayInfo.isCheckOut) && (
                      <div className="flex items-center space-x-1">
                        {dayInfo.isCheckIn && (
                          <div className="flex items-center space-x-1">
                            <ArrowRight className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Entrada</span>
                          </div>
                        )}
                        {dayInfo.isCheckOut && (
                          <div className="flex items-center space-x-1">
                            <ArrowLeft className="h-3 w-3 text-orange-600" />
                            <span className="text-xs text-orange-600 font-medium">Salida</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Leyenda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span className="text-xs text-gray-600">Disponible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                    <span className="text-xs text-gray-600">Reservado</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                    <span className="text-xs text-gray-600">Cerrado (Fines de semana)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
                    <span className="text-xs text-gray-600">¡Vaya! (Atención requerida)</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <strong>¡Vaya! se muestra cuando:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Días después de checkout (limpieza/mantenimiento)</li>
                  <li>Días antes de checkin (preparación)</li>
                  <li>Días sin reservas en temporada alta</li>
                </ul>
              </div>
            </div>

            {/* Total reservations for selected property */}
            <div className="mt-4 text-right">
              <span className="text-sm text-gray-600">
                Total reservas para {selectedProperty?.name}: {calendarBookings.length}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming arrivals and departures */}
      {selectedPropertyId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximas llegadas</CardTitle>
              <CardDescription>Check-ins de los próximos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingArrivals.length > 0 ? (
                  upcomingArrivals.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex-1">
                        <p className="font-medium text-green-800">
                          {booking.guest_name}
                        </p>
                        <p className="text-sm text-green-600">{booking.property_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-800">
                          {booking.check_in.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Check-in
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay llegadas programadas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas salidas</CardTitle>
              <CardDescription>Check-outs de los próximos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDepartures.length > 0 ? (
                  upcomingDepartures.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                      <div className="flex-1">
                        <p className="font-medium text-orange-800">
                          {booking.guest_name}
                        </p>
                        <p className="text-sm text-orange-600">{booking.property_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-800">
                          {booking.check_out.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          Check-out
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay salidas programadas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No property selected message */}
      {!selectedPropertyId && properties.length > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una propiedad</h3>
            <p className="text-gray-600">
              Elige una propiedad del selector superior para ver su calendario específico
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
