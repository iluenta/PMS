import { useEffect, useState } from "react"
import { getReservationTypes } from "@/lib/settings"

interface UseReservationTypesResult {
  types: string[]
  loading: boolean
  error: string | null
}

export function useReservationTypes(): UseReservationTypesResult {
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getReservationTypes()
        if (mounted) {
          setTypes(result)
        }
      } catch (err) {
        console.error("useReservationTypes", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Error cargando tipos de reserva")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return {
    types,
    loading,
    error,
  }
}

