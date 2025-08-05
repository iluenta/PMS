"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase, type Property, type Reservation } from "@/lib/supabase"

interface CalendarBooking {
  id: string
  guest_name: string
  check_in: Date
  check_out: Date
  property_name: string
  total_amount: number
  status: string
}

type DayStatus = 'available' | 'reserved' | 'pending' | 'closed'

interface DayInfo {
  date: Date
  status: DayStatus
  bookings: CalendarBooking[]
  price?: number
  guestName?: string
  isCheckIn?: boolean
  isCheckOut?: boolean
  checkInGuestName?: string
  checkOutGuestName?: string
}

interface EnhancedCalendarProps {
  selectedPropertyId: string
  selectedProperty?: Property | null
}

export default function EnhancedCalendar({ 
  selectedPropertyId, 
  selectedProperty 
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["L", "M", "X", "J", "V", "S", "D"]

  useEffect(() => {
    if (selectedPropertyId) {
      fetchBookings()
    }
  }, [selectedPropertyId])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      const { data: reservationsData, error } = await supabase
        .from("reservations")
        .select(`
          *,
          property_channels(
            channel:distribution_channels(*)
          )
        `)
        .eq("property_id", selectedPropertyId)
        .neq("status", "cancelled")

      if (error) throw error

      const calendarBookings: CalendarBooking[] = (reservationsData || []).map((reservation: any) => ({
        id: reservation.id,
        guest_name: reservation.guest?.name || "Sin nombre",
        check_in: new Date(reservation.check_in),
        check_out: new Date(reservation.check_out),
        property_name: selectedProperty?.name || "Propiedad desconocida",
        total_amount: reservation.total_amount || 0,
        status: reservation.status || "pending"
      }))

      setBookings(calendarBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const firstDayOfWeek = firstDay.getDay()
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - mondayOffset)

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.check_in)
      const checkOut = new Date(booking.check_out)
      const checkDate = new Date(date)
      
      // Normalizar todas las fechas al inicio del día para comparación precisa
      const normalizedCheckIn = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
      const normalizedCheckOut = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())
      const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
      
      // La reserva incluye desde el día de check-in hasta el día de check-out (inclusivo)
      return normalizedCheckDate >= normalizedCheckIn && normalizedCheckDate <= normalizedCheckOut
    })
  }

  const getDayInfo = (date: Date): DayInfo => {
    const bookingsForDate = getBookingsForDate(date)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    // Determinar estado del día
    let status: DayStatus = 'available'
    let guestName: string | undefined
    let isCheckIn = false
    let isCheckOut = false
    let price: number | undefined
    let checkInGuestName: string | undefined
    let checkOutGuestName: string | undefined

    if (bookingsForDate.length > 0) {
      const booking = bookingsForDate[0]
      status = booking.status === 'confirmed' ? 'reserved' : 'pending'
      guestName = booking.guest_name
      
      // Calcular precio por noche para la reserva
      const checkIn = new Date(booking.check_in)
      const checkOut = new Date(booking.check_out)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      const pricePerNight = nights > 0 ? booking.total_amount / nights : booking.total_amount
      price = Number(pricePerNight.toFixed(2))
      
      // Verificar si es check-in o check-out para todas las reservas del día
      const normalizedCurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      for (const booking of bookingsForDate) {
        const checkInDate = new Date(booking.check_in)
        const checkOutDate = new Date(booking.check_out)
        
        // Normalizar fechas para comparación precisa
        const normalizedCheckIn = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate())
        const normalizedCheckOut = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate())
        
        if (normalizedCurrentDate.getTime() === normalizedCheckIn.getTime()) {
          isCheckIn = true
          checkInGuestName = booking.guest_name
        }
        if (normalizedCurrentDate.getTime() === normalizedCheckOut.getTime()) {
          isCheckOut = true
          checkOutGuestName = booking.guest_name
        }
      }
    } else if (isWeekend) {
      status = 'closed'
    }

    return {
      date,
      status,
      bookings: bookingsForDate,
      price,
      guestName,
      isCheckIn,
      isCheckOut,
      checkInGuestName,
      checkOutGuestName
    }
  }

  const getStatusColors = (status: DayStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-200'
      case 'reserved':
        return 'bg-blue-50 border-blue-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'closed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const navigateQuarter = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 2)
    } else {
      newDate.setMonth(newDate.getMonth() + 2)
    }
    setCurrentDate(newDate)
  }

  const renderMonth = (monthOffset: number) => {
    const monthDate = new Date(currentDate)
    monthDate.setMonth(monthDate.getMonth() + monthOffset)
    
    const days = getDaysInMonth(monthDate)
    const monthName = monthNames[monthDate.getMonth()]
    const year = monthDate.getFullYear()

    return (
      <div key={monthOffset} className="flex-1">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{monthName} {year}</h3>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayInfo = getDayInfo(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isCurrentMonth = date.getMonth() === monthDate.getMonth()

            return (
              <div
                key={index}
                className={`p-2 h-20 border rounded-lg ${getStatusColors(dayInfo.status)} ${
                  isToday ? "ring-2 ring-blue-500" : ""
                } overflow-hidden relative`}
              >
                {/* Day number */}
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                  {date.getDate()}
                </div>

                {/* Price indicator */}
                {dayInfo.price !== undefined && dayInfo.guestName && (
                  <div className="absolute top-1 right-1">
                    <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-1 py-0.5 rounded text-xs font-medium text-gray-700">
                      <span>€{dayInfo.price}</span>
                    </div>
                  </div>
                )}

                {/* Guest information - solo mostrar si no hay entrada/salida */}
                {dayInfo.guestName && !dayInfo.isCheckIn && !dayInfo.isCheckOut && (
                  <div className="text-xs text-gray-600 mb-1 truncate">
                    {dayInfo.guestName}
                  </div>
                )}

                {/* Check-in/Check-out indicators */}
                {(dayInfo.isCheckIn || dayInfo.isCheckOut) && (
                  <div className="flex flex-col space-y-1">
                    {dayInfo.isCheckOut && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-red-600 font-medium truncate">{dayInfo.checkOutGuestName || 'Desconocido'}</span>
                      </div>
                    )}
                    {dayInfo.isCheckIn && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-green-600 font-medium truncate">{dayInfo.checkInGuestName || 'Desconocido'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            Vista de 2 Meses
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateQuarter("prev")}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateQuarter("next")}>
              Siguiente
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderMonth(0)}
          {renderMonth(1)}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Leyenda</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-xs text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-xs text-gray-600">Reservado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-xs text-gray-600">Pendiente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-xs text-gray-600">Cerrado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 