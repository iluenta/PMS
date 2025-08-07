"use client"

import { useState, useEffect } from "react"
import { supabase, type Property } from "@/lib/supabase"
import { useProperty } from "@/hooks/useProperty"
import CalendarNavigation from "./CalendarNavigation"
import PropertyStats from "./PropertyStats"
import EnhancedCalendar from "./EnhancedCalendar"
import AvailabilityList from "./AvailabilityList"

type ViewMode = 'calendar' | 'list'

export default function PropertyCalendar() {
  const [currentView, setCurrentView] = useState<ViewMode>('calendar')

  // Global property context
  const { selectedProperty } = useProperty()

  // Estados para estadísticas
  const [stats, setStats] = useState({
    occupancy: 0,
    reservedDays: 0,
    pendingDays: 0,
    availableDays: 0,
    averagePrice: 0
  })

  useEffect(() => {
    if (selectedProperty) {
      calculateStats()
    }
  }, [selectedProperty])

  const calculateStats = async () => {
    try {
      if (!selectedProperty) return

      // Obtener reservas de la propiedad
      const { data: reservationsData, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedProperty.id)

      if (error) throw error

      const reservations = reservationsData || []
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()) // Últimos 90 días
      const endDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()) // Próximos 90 días

      // Calcular estadísticas
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const reservedDays = reservations.filter(r => {
        const checkIn = new Date(r.check_in)
        const checkOut = new Date(r.check_out)
        return checkIn >= startDate && checkOut <= endDate && r.status === 'confirmed'
      }).reduce((total, r) => {
        const checkIn = new Date(r.check_in)
        const checkOut = new Date(r.check_out)
        return total + Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)

      const pendingDays = reservations.filter(r => {
        const checkIn = new Date(r.check_in)
        const checkOut = new Date(r.check_out)
        return checkIn >= startDate && checkOut <= endDate && r.status === 'pending'
      }).reduce((total, r) => {
        const checkIn = new Date(r.check_in)
        const checkOut = new Date(r.check_out)
        return total + Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)

      const availableDays = totalDays - reservedDays - pendingDays
      const occupancy = totalDays > 0 ? Math.round((reservedDays / totalDays) * 100) : 0
      const averagePrice = reservations.length > 0 
        ? Math.round(reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0) / reservations.length)
        : 0

      setStats({
        occupancy,
        reservedDays,
        pendingDays,
        availableDays,
        averagePrice
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
    }
  }

  // const selectedProperty = properties.find(p => p.id === selectedPropertyId) // This state is no longer needed

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <CalendarNavigation 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Statistics */}
      {selectedProperty && (
        <PropertyStats
          occupancy={stats.occupancy}
          reservedDays={stats.reservedDays}
          pendingDays={stats.pendingDays}
          availableDays={stats.availableDays}
          averagePrice={stats.averagePrice}
          period="últimos 90 días"
        />
      )}

      {/* Content based on current view */}
      {selectedProperty && (
        <>
          {currentView === 'calendar' && (
            <EnhancedCalendar />
          )}

          {currentView === 'list' && (
            <AvailabilityList />
          )}
        </>
      )}

      {!selectedProperty && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona una Propiedad
          </h3>
          <p className="text-gray-500">
            Elige una propiedad para ver su calendario y disponibilidad
          </p>
        </div>
      )}
    </div>
  )
} 