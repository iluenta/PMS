"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar,
  Plus
} from "lucide-react"
import QuickAvailabilityCheck from "./QuickAvailabilityCheck"
import { supabase, type Property, type Reservation } from "@/lib/supabase"

interface AvailabilityPeriod {
  startDate: Date
  endDate: Date
  nights: number
  isAvailable: boolean
  reason?: string
}

interface AvailabilityListProps {
  selectedPropertyId: string
  selectedProperty?: Property | null
}

export default function AvailabilityList({ 
  selectedPropertyId, 
  selectedProperty 
}: AvailabilityListProps) {
  const [availabilityPeriods, setAvailabilityPeriods] = useState<AvailabilityPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [quickQueryResult, setQuickQueryResult] = useState<{
    isAvailable: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    if (selectedPropertyId) {
      calculateAvailabilityPeriods()
    }
  }, [selectedPropertyId])

  const calculateAvailabilityPeriods = async () => {
    try {
      setLoading(true)

      // Obtener reservas de la propiedad
      const { data: reservationsData, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .eq("status", "confirmed")

      if (error) throw error

      const reservations = reservationsData || []
      const today = new Date()
      const currentYear = today.getFullYear()
      const startDate = new Date(currentYear, 0, 1) // 1 de enero del año actual
      const endDate = new Date(currentYear, 11, 31) // 31 de diciembre del año actual

      // Ordenar reservas por fecha de check-in
      const sortedReservations = reservations
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

        if (availableDates.length === 0) return []

        // Agrupar fechas consecutivas
        const groups: Array<{start: Date, end: Date}> = []
        let currentGroup = {
          start: new Date(availableDates[0]),
          end: new Date(availableDates[0])
        }

        for (let i = 1; i < availableDates.length; i++) {
          const currentDate = availableDates[i]
          const previousDate = availableDates[i - 1]
          
          const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          const previousDay = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate())
          
          const diffTime = currentDay.getTime() - previousDay.getTime()
          const diffDays = diffTime / (1000 * 60 * 60 * 24)
          
          if (Math.abs(diffDays - 1) < 0.1) {
            currentGroup.end = new Date(currentDate)
          } else {
            groups.push({...currentGroup})
            currentGroup = {
              start: new Date(currentDate),
              end: new Date(currentDate)
            }
          }
        }
        
        groups.push(currentGroup)
        return groups
      }

      // Obtener grupos de fechas consecutivas
      const consecutiveGroups = groupConsecutiveDates()

      // Filtrar solo grupos significativos (más de 3 días)
      const significantGroups = consecutiveGroups.filter(group => {
        const totalDays = Math.floor((group.end.getTime() - group.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return totalDays >= 3
      })

      // Generar periodos disponibles
      const periods: AvailabilityPeriod[] = significantGroups.map(group => {
        const startDate = group.start
        const endDate = group.end
        const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

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
        
        return {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          nights: totalDays,
          isAvailable: isPeriodAvailable,
          reason: isPeriodAvailable ? "Disponible" : "Ocupado"
        }
      })

      // Filtrar periodos duplicados y ordenar
      const uniquePeriods = periods
        .filter((period, index, arr) => 
          index === arr.findIndex(p => 
            p.startDate.getTime() === period.startDate.getTime() && 
            p.endDate.getTime() === period.endDate.getTime()
          )
        )
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, 10) // Mostrar solo los primeros 10 periodos

      setAvailabilityPeriods(uniquePeriods)
    } catch (error) {
      console.error("Error calculating availability periods:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString("es-ES", { weekday: "long" })
  }

  const handleCreateReservation = (period: AvailabilityPeriod) => {
    // Aquí se implementaría la lógica para crear una reserva
    console.log("Crear reserva para:", period)
    // TODO: Implementar modal de creación de reserva
  }

  const handleQuickAvailabilityCheck = async (checkIn: string, checkOut: string, nights: number) => {
    try {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      // Verificar disponibilidad
      const { data: reservationsData, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .eq("status", "confirmed")
      
      if (error) throw error
      
      const reservations = reservationsData || []
      const isAvailable = !reservations.some(reservation => {
        const reservationStart = new Date(reservation.check_in)
        const reservationEnd = new Date(reservation.check_out)
        
        // Verificar si hay conflicto
        return (
          (checkInDate >= reservationStart && checkInDate < reservationEnd) ||
          (checkOutDate > reservationStart && checkOutDate <= reservationEnd) ||
          (checkInDate <= reservationStart && checkOutDate >= reservationEnd)
        )
      })
      
      setQuickQueryResult({
        isAvailable,
        message: isAvailable 
          ? `✅ Disponible para ${nights} noche${nights > 1 ? 's' : ''} desde ${checkInDate.toLocaleDateString('es-ES')} hasta ${checkOutDate.toLocaleDateString('es-ES')}`
          : `❌ No disponible para ${nights} noche${nights > 1 ? 's' : ''} desde ${checkInDate.toLocaleDateString('es-ES')} hasta ${checkOutDate.toLocaleDateString('es-ES')}`
      })
    } catch (error) {
      console.error("Error verificando disponibilidad:", error)
      setQuickQueryResult({
        isAvailable: false,
        message: "Error al verificar disponibilidad"
      })
    }
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
    <div className="space-y-6">
      {/* Quick Availability Check Section */}
      <QuickAvailabilityCheck 
        selectedPropertyId={selectedPropertyId}
        onCheckAvailability={handleQuickAvailabilityCheck}
      />
      
      {/* Quick Query Result */}
      {quickQueryResult && (
        <Card className={`border-2 ${
          quickQueryResult.isAvailable 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                quickQueryResult.isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                quickQueryResult.isAvailable ? 'text-green-800' : 'text-red-800'
              }`}>
                {quickQueryResult.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Periods List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Periodos Disponibles
            {selectedProperty && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                - {selectedProperty.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
        {availabilityPeriods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilityPeriods.map((period, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  period.isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      Disponible
                    </span>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    {period.nights} noche{period.nights > 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Desde {formatDate(period.startDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatWeekday(period.startDate)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Hasta {formatDate(period.endDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatWeekday(period.endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {period.isAvailable && (
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleCreateReservation(period)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Reserva
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay periodos disponibles</h3>
            <p className="text-gray-500">Intenta con otro mes o revisa las restricciones de la propiedad</p>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
} 