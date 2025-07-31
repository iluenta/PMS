"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase, type Booking, type Property } from "@/lib/supabase"
import { CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

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

export default function Calendar() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching calendar data from reservations...")
      
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
        .eq("status", "confirmed")
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
            booking_source: reservation.property_channels?.distribution_channels?.name || reservation.external_source || 'Direct',
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
      
      if (propertiesData) setProperties(propertiesData)

      // If no data exists, show information about it
      if (!reservationsData || reservationsData.length === 0) {
        console.log("ℹ️ No reservations found in database")
      }
      if (!propertiesData || propertiesData.length === 0) {
        console.log("ℹ️ No properties found in database")
      }

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calendarBookings = useMemo(() => {
    return bookings.map((booking) => ({
      id: booking.id,
      guest_name: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
      check_in: new Date(booking.check_in),
      check_out: new Date(booking.check_out),
      property_name: booking.property?.name || 'Sin nombre',
      total_amount: booking.total_amount,
      status: booking.status,
      booking: booking
    })) as CalendarBooking[]
  }, [bookings])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Calculate starting day of week (0 = Sunday, 1 = Monday, etc.)
    // We want Monday = 0, Tuesday = 1, ..., Sunday = 6
    let startingDayOfWeek = firstDay.getDay()
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getBookingsForDate = (date: Date) => {
    if (!date) return []

    // Normalize the current date to start of day
    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    return calendarBookings.filter((booking) => {
      // Normalize booking dates to start of day
      const checkInDate = new Date(booking.check_in.getFullYear(), booking.check_in.getMonth(), booking.check_in.getDate())
      const checkOutDate = new Date(booking.check_out.getFullYear(), booking.check_out.getMonth(), booking.check_out.getDate())
      
      // A booking is active on a date if:
      // - The date is >= check-in date AND
      // - The date is < check-out date (exclusive)
      return currentDate >= checkInDate && currentDate < checkOutDate
    })
  }

  const getBookingsForDateRange = (startDate: Date, endDate: Date) => {
    // Normalize the range dates to start of day
    const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    
    return calendarBookings.filter((booking) => {
      // Normalize booking dates to start of day
      const checkInDate = new Date(booking.check_in.getFullYear(), booking.check_in.getMonth(), booking.check_in.getDate())
      const checkOutDate = new Date(booking.check_out.getFullYear(), booking.check_out.getMonth(), booking.check_out.getDate())
      
      // Check if booking overlaps with the date range
      return (
        (checkInDate <= normalizedEndDate && checkOutDate > normalizedStartDate) ||
        (checkInDate >= normalizedStartDate && checkInDate < normalizedEndDate)
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
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
      .sort((a, b) => new Date(a.check_out).getTime() - new Date(b.check_out).getTime())
      .slice(0, 5)
  }, [calendarBookings])

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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

              const dayBookings = getBookingsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`p-2 h-32 border rounded-lg ${
                    isToday ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                  } overflow-hidden relative`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                    {date.getDate()}
                  </div>

                  {/* Booking bars */}
                  <div className="space-y-1 mt-1">
                    {dayBookings.map((booking, bookingIndex) => (
                      <div
                        key={booking.id}
                        className="h-6 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center justify-between"
                        style={{
                          backgroundColor: booking.status === 'confirmed' ? '#3b82f6' : 
                                        booking.status === 'pending' ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        <span className="truncate font-medium">
                          {booking.guest_name}
                        </span>
                        <span className="text-xs opacity-75">
                          €{booking.total_amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Available indicator */}
                  {dayBookings.length === 0 && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-xs text-gray-400 text-center">Disponible</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
