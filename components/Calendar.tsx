"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase, isDemoMode, mockData, type Booking, type Property } from "@/lib/supabase"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

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
      if (isDemoMode) {
        const mockBookingsWithRelations = mockData.bookings
          .filter((booking) => booking.status === "confirmed")
          .map((booking) => ({
            ...booking,
            property: mockData.properties.find((p) => p.id === booking.property_id),
            guest: mockData.guests.find((g) => g.id === booking.guest_id),
          }))

        setBookings(mockBookingsWithRelations)
        setProperties(mockData.properties.filter((p) => p.status === "active"))
        return
      }

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          property:properties(*),
          guest:guests(*)
        `)
        .eq("status", "confirmed")

      const { data: propertiesData } = await supabase.from("properties").select("*").eq("status", "active")

      if (bookingsData) setBookings(bookingsData)
      if (propertiesData) setProperties(propertiesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

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

    const dateStr = date.toISOString().split("T")[0]
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.check_in)
      const checkOut = new Date(booking.check_out)
      const currentDate = new Date(dateStr)

      return currentDate >= checkIn && currentDate < checkOut
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

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

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
                return <div key={index} className="p-2 h-24"></div>
              }

              const dayBookings = getBookingsForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`p-2 h-24 border rounded-lg ${
                    isToday ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                  } overflow-hidden`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                    {date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((booking, bookingIndex) => (
                      <div
                        key={bookingIndex}
                        className="text-xs p-1 rounded bg-green-100 text-green-800 truncate"
                        title={`${booking.guest?.first_name} ${booking.guest?.last_name} - ${booking.property?.name}`}
                      >
                        {booking.property?.name}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayBookings.length - 2} más</div>
                    )}
                  </div>
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
              {bookings
                .filter((booking) => {
                  const checkIn = new Date(booking.check_in)
                  const today = new Date()
                  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                  return checkIn >= today && checkIn <= nextWeek
                })
                .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {booking.guest?.first_name} {booking.guest?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{booking.property?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
                      <Badge variant="outline">Check-in</Badge>
                    </div>
                  </div>
                ))}
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
              {bookings
                .filter((booking) => {
                  const checkOut = new Date(booking.check_out)
                  const today = new Date()
                  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                  return checkOut >= today && checkOut <= nextWeek
                })
                .sort((a, b) => new Date(a.check_out).getTime() - new Date(b.check_out).getTime())
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {booking.guest?.first_name} {booking.guest?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{booking.property?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(booking.check_out).toLocaleDateString()}</p>
                      <Badge variant="secondary">Check-out</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
