import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useProperty } from '@/contexts/PropertyContext'

export interface DashboardStats {
  reservations: number
  guests: number
  grossIncome: number
  netProfit: number
  commissions: number
  expenses: number
}

export interface DashboardFilters {
  yearFilter: string
  availableYears: number[]
}

export function useDashboardStats() {
  const { user } = useAuth()
  const { selectedProperty } = useProperty()
  
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    reservations: 0,
    guests: 0,
    grossIncome: 0,
    netProfit: 0,
    commissions: 0,
    expenses: 0
  })

  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Función para verificar si una fecha está en el año seleccionado
  const isDateInYear = (date: string, year: string) => {
    if (year === "all") return true
    const dateYear = new Date(date).getFullYear().toString()
    return dateYear === year
  }

  // Cargar estadísticas
  const loadStats = async () => {
    if (!selectedProperty || !user?.tenant_id) {
      setStats({
        reservations: 0,
        guests: 0,
        grossIncome: 0,
        netProfit: 0,
        commissions: 0,
        expenses: 0
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // 1. Cargar reservas de la propiedad
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('property_id', selectedProperty.id)
        .eq('tenant_id', user.tenant_id)

      if (reservationsError) {
        console.error('Error loading reservations:', reservationsError)
        throw reservationsError
      }

      // 2. Cargar gastos de la propiedad
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('property_id', selectedProperty.id)
        .eq('tenant_id', user.tenant_id)

      if (expensesError) {
        console.error('Error loading expenses:', expensesError)
        throw expensesError
      }

      // 3. Filtrar datos por año
      const filteredReservations = reservations?.filter(reservation => 
        isDateInYear(reservation.check_in, yearFilter)
      ) || []

      const filteredExpenses = expenses?.filter(expense => 
        isDateInYear(expense.date, yearFilter)
      ) || []

      // 4. Calcular estadísticas
      const newStats = calculateStats(filteredReservations, filteredExpenses)
      setStats(newStats)

      // 5. Actualizar años disponibles
      const yearsFromReservations = new Set<number>()
      reservations?.forEach(reservation => {
        if (reservation.check_in) {
          yearsFromReservations.add(new Date(reservation.check_in).getFullYear())
        }
      })
      
      const currentYear = new Date().getFullYear()
      yearsFromReservations.add(currentYear)
      
      // Actualizar availableYears
      const sortedYears = Array.from(yearsFromReservations).sort((a, b) => b - a)
      setAvailableYears(sortedYears)

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      setStats({
        reservations: 0,
        guests: 0,
        grossIncome: 0,
        netProfit: 0,
        commissions: 0,
        expenses: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular las estadísticas
  const calculateStats = (reservations: any[], expenses: any[]): DashboardStats => {
    // 1. Reservas (todas excepto canceladas)
    const validReservations = reservations.filter(r => r.status !== 'cancelled')
    const reservationsCount = validReservations.length

    // 2. Huéspedes únicos (por email)
    const uniqueGuests = new Set<string>()
    validReservations.forEach(reservation => {
      if (reservation.guest?.email) {
        uniqueGuests.add(reservation.guest.email)
      }
    })
    const guestsCount = uniqueGuests.size

    // 3. Ingresos Brutos (reservas no canceladas)
    const grossIncome = validReservations.reduce((sum, reservation) => {
      return sum + (reservation.total_amount || 0)
    }, 0)

    // 4. Comisiones (con IVA 21% aplicado)
    const commissionsBeforeIVA = validReservations.reduce((sum, reservation) => {
      const channelCommission = reservation.channel_commission || 0
      const collectionCommission = reservation.collection_commission || 0
      return sum + channelCommission + collectionCommission
    }, 0)
    
    // Aplicar IVA 21% a las comisiones
    const commissionsWithIVA = commissionsBeforeIVA * 1.21

    // 5. Gastos (pending + completed) - TODOS los gastos para mostrar en la tarjeta
    const validExpenses = expenses.filter(e => 
      e.status === 'pending' || e.status === 'completed'
    )
    const expensesTotal = validExpenses.reduce((sum, expense) => {
      return sum + (expense.amount || 0)
    }, 0)

    // 6. Gastos asociados a reservas (solo estos se restan del beneficio neto)
    const reservationExpenses = validExpenses.filter(e => 
      e.reservation_id !== null && e.reservation_id !== undefined
    )
    const reservationExpensesTotal = reservationExpenses.reduce((sum, expense) => {
      return sum + (expense.amount || 0)
    }, 0)

    // 7. Beneficio Neto (Ingresos - Gastos de Reservas - Comisiones con IVA)
    const netProfit = grossIncome - reservationExpensesTotal - commissionsWithIVA

    return {
      reservations: reservationsCount,
      guests: guestsCount,
      grossIncome,
      netProfit,
      commissions: commissionsWithIVA,
      expenses: expensesTotal // Mostrar todos los gastos en la tarjeta
    }
  }

  // Cargar estadísticas cuando cambie la propiedad o el filtro de año
  useEffect(() => {
    loadStats()
  }, [selectedProperty, yearFilter, user?.tenant_id])

  return {
    stats,
    loading,
    yearFilter,
    setYearFilter,
    availableYears,
    refreshStats: loadStats
  }
}
