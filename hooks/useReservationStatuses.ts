import { useState, useEffect } from 'react'
import { getReservationStatuses, getReservationStatusByName, isValidReservationStatus } from '@/lib/settings'

export interface ReservationStatus {
  name: string
  color: string
}

export function useReservationStatuses() {
  const [statuses, setStatuses] = useState<ReservationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    try {
      setLoading(true)
      setError(null)
      const reservationStatuses = await getReservationStatuses()
      setStatuses(reservationStatuses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estados de reserva')
      console.error('Error en useReservationStatuses:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusByName = async (statusName: string): Promise<ReservationStatus | null> => {
    try {
      return await getReservationStatusByName(statusName)
    } catch (err) {
      console.error('Error obteniendo estado por nombre:', err)
      return null
    }
  }

  const validateStatus = async (statusName: string): Promise<boolean> => {
    try {
      return await isValidReservationStatus(statusName)
    } catch (err) {
      console.error('Error validando estado:', err)
      return false
    }
  }

  const refreshStatuses = () => {
    loadStatuses()
  }

  return {
    statuses,
    loading,
    error,
    getStatusByName,
    validateStatus,
    refreshStatuses
  }
}

export function useReservationStatusByName(statusName: string) {
  const [status, setStatus] = useState<ReservationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (statusName) {
      loadStatus()
    }
  }, [statusName])

  const loadStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const reservationStatus = await getReservationStatusByName(statusName)
      setStatus(reservationStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estado de reserva')
      console.error('Error en useReservationStatusByName:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    status,
    loading,
    error,
    refresh: loadStatus
  }
}
