"use client"

import { useState, useEffect } from "react"
import { supabase, type Property } from "@/lib/supabase"
import CalendarNavigation from "./CalendarNavigation"
import PropertyConfig from "./PropertyConfig"
import PropertyStats from "./PropertyStats"
import EnhancedCalendar from "./EnhancedCalendar"
import AvailabilityList from "./AvailabilityList"

type ViewMode = 'calendar' | 'list' | 'statistics'

export default function PropertyCalendar() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [currentView, setCurrentView] = useState<ViewMode>('calendar')
  const [loading, setLoading] = useState(true)

  // Estados para estadísticas
  const [stats, setStats] = useState({
    occupancy: 0,
    reservedDays: 0,
    pendingDays: 0,
    availableDays: 0,
    averagePrice: 0
  })

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    if (selectedPropertyId) {
      calculateStats()
    }
  }, [selectedPropertyId])

  const loadProperties = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      
      const propertiesData = data || []
      setProperties(propertiesData)
      
      // Auto-seleccionar la primera propiedad si existe
      if (propertiesData.length > 0) {
        setSelectedPropertyId(propertiesData[0].id)
      }
    } catch (error) {
      console.error("Error loading properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = async () => {
    try {
      // Obtener reservas de la propiedad
      const { data: reservationsData, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedPropertyId)

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

  const selectedProperty = properties.find(p => p.id === selectedPropertyId)

  const handleFilters = () => {
    console.log("Abrir filtros")
    // TODO: Implementar modal de filtros
  }

  const handleSearch = () => {
    console.log("Abrir búsqueda")
    // TODO: Implementar búsqueda
  }

  const handleExport = () => {
    console.log("Exportar datos")
    // TODO: Implementar exportación
  }

  const handleNewReservation = () => {
    console.log("Nueva reserva")
    // TODO: Implementar modal de nueva reserva
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
      {/* Navigation */}
      <CalendarNavigation 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Property Configuration */}
      <PropertyConfig
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertyChange={setSelectedPropertyId}
        selectedProperty={selectedProperty}
        onFilters={handleFilters}
        onSearch={handleSearch}
        onExport={handleExport}
        onNewReservation={handleNewReservation}
      />

      {/* Statistics */}
      {selectedPropertyId && (
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
      {selectedPropertyId && (
        <>
          {currentView === 'calendar' && (
            <EnhancedCalendar
              selectedPropertyId={selectedPropertyId}
              selectedProperty={selectedProperty}
            />
          )}

          {currentView === 'list' && (
            <AvailabilityList
              selectedPropertyId={selectedPropertyId}
              selectedProperty={selectedProperty}
            />
          )}

          {currentView === 'statistics' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Estadísticas Detalladas
              </h3>
              <p className="text-gray-500">
                Vista de estadísticas avanzadas próximamente
              </p>
            </div>
          )}
        </>
      )}

      {!selectedPropertyId && (
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