"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, type Property, type Reservation } from "@/lib/supabase"
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
  Building,
} from "lucide-react"

interface AvailabilitySlot {
  startDate: Date
  endDate: Date
  nights: number
  isAvailable: boolean
  reason?: string
}

interface PropertyAvailabilitySettings {
  minStay: number
  maxStay: number
  checkInTime: string
  checkOutTime: string
}

export default function Availability() {
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [nights, setNights] = useState(1)
  const [loading, setLoading] = useState(true)
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [quickCheckResult, setQuickCheckResult] = useState<{
    isAvailable: boolean
    reason?: string
    nights: number
    conflicts?: Array<{
      startDate: Date
      endDate: Date
      guestName: string
    }>
    settings: PropertyAvailabilitySettings
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      calculateAvailability()
    }
  }, [selectedProperty, reservations])

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
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")

      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("*")
        .eq("status", "confirmed")

      if (propertiesData) {
        setProperties(propertiesData)
        if (propertiesData.length > 0) {
          setSelectedProperty(propertiesData[0].id)
        }
      }
      if (reservationsData) setReservations(reservationsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPropertySettings = (propertyId: string): PropertyAvailabilitySettings => {
    const property = properties.find((p) => p.id === propertyId)
    return {
      minStay: property?.min_stay || 1,
      maxStay: property?.max_stay || 30,
      checkInTime: property?.check_in_time || "15:00:00",
      checkOutTime: property?.check_out_time || "11:00:00"
    }
  }

  const calculateAvailability = () => {
    if (!selectedProperty) return

    const property = properties.find((p) => p.id === selectedProperty)
    const settings = getPropertySettings(selectedProperty)
    const propertyReservations = reservations.filter((r) => r.property_id === selectedProperty)

    if (!property) return

    const slots: AvailabilitySlot[] = []
    const today = new Date()
    const currentYear = today.getFullYear()
    const startDate = new Date(currentYear, 0, 1) // 1 de enero del año actual
    const endDate = new Date(currentYear, 11, 31) // 31 de diciembre del año actual

    // Ordenar reservas por fecha de check-in
    const sortedReservations = propertyReservations
      .map(r => ({
        start: new Date(r.check_in),
        end: new Date(r.check_out),
        guest: r.guest?.name || "Sin nombre"
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    // Función para verificar si una fecha está disponible
    const isDateAvailable = (date: Date): boolean => {
      if (date < today) return false
      
      return !sortedReservations.some(reservation => {
        const reservationStart = new Date(reservation.start)
        const reservationEnd = new Date(reservation.end)
        return date >= reservationStart && date < reservationEnd
      })
    }

    // Función para agrupar fechas consecutivas
    const groupConsecutiveDates = (): Array<{start: Date, end: Date}> => {
      const availableDates: Date[] = []
      
      // Generar todas las fechas del año
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        if (isDateAvailable(currentDate)) {
          availableDates.push(new Date(currentDate))
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      console.log("🔍 Debug - Fechas disponibles encontradas:", availableDates.length)
      console.log("🔍 Debug - Primera fecha disponible:", availableDates[0])
      console.log("🔍 Debug - Última fecha disponible:", availableDates[availableDates.length - 1])

      // Debug específico para el periodo problemático
      const problematicDates = availableDates.filter(date => {
        const day = date.getDate()
        const month = date.getMonth()
        return month === 9 && day >= 23 && day <= 31 // Octubre 23-31
      })
      console.log("🔍 Debug - Fechas disponibles del 23-31 octubre:", problematicDates.map(d => d.toDateString()))

      if (availableDates.length === 0) return []

      // Agrupar fechas consecutivas usando un enfoque más simple
      const groups: Array<{start: Date, end: Date}> = []
      let currentGroup = {
        start: new Date(availableDates[0]),
        end: new Date(availableDates[0])
      }

      for (let i = 1; i < availableDates.length; i++) {
        const currentDate = availableDates[i]
        const previousDate = availableDates[i - 1]
        
        // Calcular diferencia en días usando fechas normalizadas
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        const previousDay = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate())
        
        const diffTime = currentDay.getTime() - previousDay.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        
        console.log(`🔍 Debug - Comparando: ${previousDate.toDateString()} vs ${currentDate.toDateString()}, diferencia: ${diffDays} días`)
        
        // Si la diferencia es aproximadamente 1 día (con tolerancia para cambio de horario)
        if (Math.abs(diffDays - 1) < 0.1) {
          currentGroup.end = new Date(currentDate)
          console.log(`🔍 Debug - Extendiendo grupo hasta: ${currentDate.toDateString()}`)
        } else {
          // Finalizar grupo actual y comenzar uno nuevo
          console.log(`🔍 Debug - Finalizando grupo: ${currentGroup.start.toDateString()} → ${currentGroup.end.toDateString()}`)
          groups.push({...currentGroup})
          currentGroup = {
            start: new Date(currentDate),
            end: new Date(currentDate)
          }
        }
      }
      
      // Agregar el último grupo
      groups.push(currentGroup)
      
      console.log("🔍 Debug - Grupos de fechas consecutivas:", groups.length)
      console.log("🔍 Debug - Último grupo:", groups[groups.length - 1])
      
      return groups
    }

    // Obtener grupos de fechas consecutivas
    const consecutiveGroups = groupConsecutiveDates()

    // Filtrar solo grupos significativos (más de 3 días)
    const significantGroups = consecutiveGroups.filter(group => {
      const totalDays = Math.floor((group.end.getTime() - group.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return totalDays >= 3 // Solo grupos de 3 días o más
    })

    console.log("🔍 Debug - Grupos significativos (3+ días):", significantGroups.length)

    // Generar slots basados en los grupos y parámetros de configuración
    significantGroups.forEach(group => {
      const startDate = group.start
      const endDate = group.end
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      console.log(`🔍 Debug - Procesando grupo significativo: ${startDate.toDateString()} a ${endDate.toDateString()} (${totalDays} días)`)

      // Solo generar un slot por grupo que cubra todo el rango disponible
      // Verificar que el periodo completo esté disponible
      let isPeriodAvailable = true
      for (let day = 0; day < totalDays; day++) {
        const testDate = new Date(startDate)
        testDate.setDate(testDate.getDate() + day)
        if (!isDateAvailable(testDate)) {
          isPeriodAvailable = false
          break
        }
      }
      
      if (isPeriodAvailable && totalDays >= settings.minStay) {
        slots.push({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          nights: totalDays,
          isAvailable: true,
          reason: "Disponible"
        })
      }
    })

    // Filtrar slots duplicados y ordenar
    const uniqueSlots = slots
      .filter((slot, index, arr) => 
        index === arr.findIndex(s => 
          s.startDate.getTime() === slot.startDate.getTime() && 
          s.endDate.getTime() === slot.endDate.getTime()
        )
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 100) // Aumentar límite para mostrar más periodos del año

    console.log("🔍 Debug - Total slots encontrados:", slots.length)
    console.log("🔍 Debug - Slots únicos:", uniqueSlots.length)
    console.log("🔍 Debug - Último slot:", uniqueSlots[uniqueSlots.length - 1])
    console.log("🔍 Debug - Reservas de la propiedad:", propertyReservations.length)

    setAvailabilitySlots(uniqueSlots)
  }

  const checkSpecificAvailability = () => {
    if (!selectedProperty || !checkInDate || !checkOutDate) {
      setQuickCheckResult(null)
      return
    }

    const startDate = new Date(checkInDate)
    const endDate = new Date(checkOutDate)
    const settings = getPropertySettings(selectedProperty)
    const propertyReservations = reservations.filter((r) => r.property_id === selectedProperty)

    // Validate basic rules
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (nights < settings.minStay) {
      setQuickCheckResult({
        isAvailable: false,
        reason: `Estancia mínima requerida: ${settings.minStay} noches`,
        nights,
        settings
      })
      return
    }

    if (nights > settings.maxStay) {
      setQuickCheckResult({
        isAvailable: false,
        reason: `Estancia máxima permitida: ${settings.maxStay} noches`,
        nights,
        settings
      })
      return
    }

    // Check for conflicts with existing reservations
    const conflicts = propertyReservations.filter((reservation) => {
      const reservationStart = new Date(reservation.check_in)
      const reservationEnd = new Date(reservation.check_out)
      return startDate < reservationEnd && endDate > reservationStart
    })

    if (conflicts.length > 0) {
      setQuickCheckResult({
        isAvailable: false,
        reason: "Periodo ocupado",
        nights,
        conflicts: conflicts.map(c => ({
          startDate: new Date(c.check_in),
          endDate: new Date(c.check_out),
          guestName: c.guest?.name || "Sin nombre"
        })),
        settings
      })
      return
    }

    setQuickCheckResult({
      isAvailable: true,
      reason: "Disponible",
      nights,
      settings
    })
  }



  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
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

      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Seleccionar Propiedad
          </CardTitle>
          <CardDescription>
            Elige una propiedad para ver su disponibilidad específica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="property-select">Propiedad</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
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
            {selectedPropertyData && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Propiedad seleccionada:</strong> {selectedPropertyData.name}
                {selectedPropertyData.address && (
                  <span className="block text-xs text-gray-500">
                    {selectedPropertyData.address}
                  </span>
                )}
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
                  {new Date().getFullYear()} - Todos los periodos disponibles
                </CardDescription>
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

      {/* Quick Check Result */}
      {quickCheckResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Resultado de la Consulta Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-3">
              {quickCheckResult.isAvailable ? (
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 mr-2" />
              )}
              <span className={`font-medium ${quickCheckResult.isAvailable ? "text-green-800" : "text-red-800"}`}>
                {quickCheckResult.reason}
              </span>
                </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Estancia: {quickCheckResult.nights} noche{quickCheckResult.nights > 1 ? "s" : ""}</p>
              <p>Configuración: {quickCheckResult.settings.minStay} - {quickCheckResult.settings.maxStay} noches</p>
              <p>Check-in: {quickCheckResult.settings.checkInTime}</p>
              <p>Check-out: {quickCheckResult.settings.checkOutTime}</p>
              </div>
            {quickCheckResult.conflicts && quickCheckResult.conflicts.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Conflictos:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {quickCheckResult.conflicts.map((conflict, index) => (
                    <li key={index}>
                      {formatDate(conflict.startDate)} - {formatDate(conflict.endDate)} (Invitado: {conflict.guestName})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
