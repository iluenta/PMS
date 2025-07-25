"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, isDemoMode, mockData, type Property, type Booking, type AvailabilitySetting } from "@/lib/supabase"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react"

interface AvailabilitySlot {
  startDate: Date
  endDate: Date
  nights: number
  isAvailable: boolean
  reason?: string
}

export default function Availability() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySetting[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [nights, setNights] = useState(1)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      calculateAvailability()
    }
  }, [selectedProperty, currentDate, bookings, availabilitySettings])

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setNights(diffDays)
    }
  }, [checkInDate, checkOutDate])

  const fetchData = async () => {
    try {
      if (isDemoMode) {
        setProperties(mockData.properties.filter((p) => p.status === "active"))
        setBookings(mockData.bookings.filter((b) => b.status === "confirmed"))
        setAvailabilitySettings(mockData.availabilitySettings)
        if (mockData.properties.length > 0) {
          setSelectedProperty(mockData.properties[0].id)
        }
        return
      }

      const { data: propertiesData } = await supabase.from("properties").select("*").eq("status", "active")

      const { data: bookingsData } = await supabase.from("bookings").select("*").eq("status", "confirmed")

      const { data: availabilityData } = await supabase.from("availability_settings").select("*").eq("is_active", true)

      if (propertiesData) {
        setProperties(propertiesData)
        if (propertiesData.length > 0) {
          setSelectedProperty(propertiesData[0].id)
        }
      }
      if (bookingsData) setBookings(bookingsData)
      if (availabilityData) setAvailabilitySettings(availabilityData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAvailability = () => {
    if (!selectedProperty) return

    const property = properties.find((p) => p.id === selectedProperty)
    const settings = availabilitySettings.find((s) => s.property_id === selectedProperty)
    const propertyBookings = bookings.filter((b) => b.property_id === selectedProperty)

    if (!property || !settings) return

    const slots: AvailabilitySlot[] = []
    const today = new Date()
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Generate all possible date ranges for the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

      // Skip past dates
      if (currentDay < today) continue

      // Check advance booking restriction
      const daysDifference = Math.ceil((currentDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDifference < settings.advance_booking_days) continue

      // Check if it's a valid check-in day
      const dayName = currentDay.toLocaleDateString("en-US", { weekday: "lowercase" })
      if (!settings.check_in_days.includes(dayName)) continue

      // Try different stay lengths
      for (let stayLength = settings.min_nights; stayLength <= Math.min(settings.max_nights, 14); stayLength++) {
        const checkOut = new Date(currentDay)
        checkOut.setDate(checkOut.getDate() + stayLength)

        // Check if checkout day is valid
        const checkOutDayName = checkOut.toLocaleDateString("en-US", { weekday: "lowercase" })
        if (!settings.check_out_days.includes(checkOutDayName)) continue

        // Check for conflicts with existing bookings
        const hasConflict = propertyBookings.some((booking) => {
          const bookingStart = new Date(booking.check_in)
          const bookingEnd = new Date(booking.check_out)
          return currentDay < bookingEnd && checkOut > bookingStart
        })

        slots.push({
          startDate: new Date(currentDay),
          endDate: new Date(checkOut),
          nights: stayLength,
          isAvailable: !hasConflict,
          reason: hasConflict ? "Ocupado" : undefined,
        })
      }
    }

    // Sort by start date and filter duplicates
    const uniqueSlots = slots
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .filter(
        (slot, index, arr) =>
          index === 0 ||
          slot.startDate.getTime() !== arr[index - 1].startDate.getTime() ||
          slot.nights !== arr[index - 1].nights,
      )

    setAvailabilitySlots(uniqueSlots.slice(0, 20)) // Limit to 20 results
  }

  const checkSpecificAvailability = () => {
    if (!selectedProperty || !checkInDate || !checkOutDate) return

    const property = properties.find((p) => p.id === selectedProperty)
    const settings = availabilitySettings.find((s) => s.property_id === selectedProperty)
    const propertyBookings = bookings.filter((b) => b.property_id === selectedProperty)

    if (!property || !settings) return

    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    const today = new Date()

    // Check advance booking
    const daysDifference = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDifference < settings.advance_booking_days) {
      alert(`Se requiere al menos ${settings.advance_booking_days} días de antelación`)
      return
    }

    // Check minimum nights
    if (nights < settings.min_nights) {
      alert(`Estancia mínima: ${settings.min_nights} noches`)
      return
    }

    // Check maximum nights
    if (nights > settings.max_nights) {
      alert(`Estancia máxima: ${settings.max_nights} noches`)
      return
    }

    // Check valid check-in day
    const checkInDayName = start.toLocaleDateString("en-US", { weekday: "lowercase" })
    if (!settings.check_in_days.includes(checkInDayName)) {
      alert(`Check-in no permitido en ${start.toLocaleDateString("es-ES", { weekday: "long" })}`)
      return
    }

    // Check valid check-out day
    const checkOutDayName = end.toLocaleDateString("en-US", { weekday: "lowercase" })
    if (!settings.check_out_days.includes(checkOutDayName)) {
      alert(`Check-out no permitido en ${end.toLocaleDateString("es-ES", { weekday: "long" })}`)
      return
    }

    // Check for conflicts
    const hasConflict = propertyBookings.some((booking) => {
      const bookingStart = new Date(booking.check_in)
      const bookingEnd = new Date(booking.check_out)
      return start < bookingEnd && end > bookingStart
    })

    if (hasConflict) {
      alert("❌ No disponible - Fechas ocupadas")
    } else {
      alert("✅ Disponible - Puedes confirmar la reserva")
    }
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const getPropertySettings = (propertyId: string) => {
    return availabilitySettings.find((s) => s.property_id === propertyId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const selectedPropertyData = properties.find((p) => p.id === selectedProperty)
  const selectedSettings = getPropertySettings(selectedProperty)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disponibilidad</h1>
        <p className="mt-2 text-gray-600">Consulta rápidamente los huecos libres en tus propiedades</p>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Seleccionar Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Propiedad</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSettings && (
              <div className="space-y-2">
                <Label>Configuración</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Mín. noches: {selectedSettings.min_nights}</p>
                  <p>• Máx. noches: {selectedSettings.max_nights}</p>
                  <p>• Antelación: {selectedSettings.advance_booking_days} días</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Availability Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Consulta Rápida
          </CardTitle>
          <CardDescription>Verifica disponibilidad para fechas específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in</Label>
              <Input
                id="checkin"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out</Label>
              <Input
                id="checkout"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Noches</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                <span className="text-sm font-medium">{nights}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={checkSpecificAvailability}
                disabled={!selectedProperty || !checkInDate || !checkOutDate}
                className="w-full"
              >
                Verificar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Slots Calendar */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Huecos Disponibles - {selectedPropertyData?.name}
                </CardTitle>
                <CardDescription>
                  {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </CardDescription>
              </div>
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
            {availabilitySlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availabilitySlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      slot.isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {slot.isAvailable ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        )}
                        <span className={`font-medium ${slot.isAvailable ? "text-green-800" : "text-red-800"}`}>
                          {slot.isAvailable ? "Disponible" : "Ocupado"}
                        </span>
                      </div>
                      <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                        {slot.nights} noche{slot.nights > 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="font-medium">
                        {formatDate(slot.startDate)} → {formatDate(slot.endDate)}
                      </p>
                      <p className="text-gray-600">
                        {slot.startDate.toLocaleDateString("es-ES", { weekday: "long" })} →{" "}
                        {slot.endDate.toLocaleDateString("es-ES", { weekday: "long" })}
                      </p>
                      {slot.reason && (
                        <p className="text-red-600 text-xs flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {slot.reason}
                        </p>
                      )}
                    </div>

                    {slot.isAvailable && (
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setCheckInDate(slot.startDate.toISOString().split("T")[0])
                          setCheckOutDate(slot.endDate.toISOString().split("T")[0])
                        }}
                      >
                        Usar estas fechas
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay huecos disponibles</h3>
                <p className="text-gray-500">Intenta con otro mes o revisa las restricciones de la propiedad</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Restrictions Summary */}
      {selectedSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Restricciones de la Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Estancia</h4>
                <div className="space-y-2 text-sm">
                  <p>• Mínimo: {selectedSettings.min_nights} noches</p>
                  <p>• Máximo: {selectedSettings.max_nights} noches</p>
                  <p>• Antelación mínima: {selectedSettings.advance_booking_days} días</p>
                  <p>• Antelación máxima: {selectedSettings.max_advance_booking_days} días</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Días Permitidos</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Check-in:</p>
                    <p className="text-gray-600">
                      {selectedSettings.check_in_days
                        .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                        .join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Check-out:</p>
                    <p className="text-gray-600">
                      {selectedSettings.check_out_days
                        .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
