import { useCallback, useEffect, useMemo, useState } from "react"
import type { OverviewFilters, OverviewMetrics } from "@/lib/reports"
import { useProperty } from "@/contexts/PropertyContext"
import { useAuth } from "@/contexts/AuthContext"
import type { ReportsFiltersValue } from "@/app/reports/components/ReportsFilters"

interface UseReportsOverviewOptions {
  filters: ReportsFiltersValue
  enabled?: boolean
}

interface UseReportsOverviewResult {
  data: OverviewMetrics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useReportsOverview({ filters, enabled = true }: UseReportsOverviewOptions): UseReportsOverviewResult {
  const { user } = useAuth()
  const { selectedProperty } = useProperty()

  const tenantId = user?.tenant_id
  const propertyId = filters.propertyId === "all" ? "all" : (filters.propertyId ?? selectedProperty?.id)
  const channel = filters.channel
  const dateFrom = filters.dateRange.from
  const dateTo = filters.dateRange.to

  const payload: OverviewFilters | null = useMemo(() => {
    if (!tenantId) return null

    return {
      tenantId,
      propertyId,
      channel,
      dateFrom,
      dateTo
    }
  }, [tenantId, propertyId, channel, dateFrom, dateTo])

  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(async (signal?: AbortSignal) => {
    if (!enabled || !payload) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/reports/overview", {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Error fetching overview (${response.status})`)
      }

      const result: OverviewMetrics = await response.json()
      setData(result)
    } catch (err) {
      if ((err as any)?.name === "AbortError") return
      console.error("useReportsOverview", err)
      setError("No se pudo cargar el resumen de reportes.")
    } finally {
      setLoading(false)
    }
  }, [enabled, payload])

  useEffect(() => {
    if (!enabled || !payload) {
      return
    }

    const controller = new AbortController()
    fetchOverview(controller.signal)
    return () => controller.abort()
  }, [enabled, payload, fetchOverview])

  const refetch = useCallback(async () => {
    await fetchOverview()
  }, [fetchOverview])

  return {
    data,
    loading,
    error,
    refetch
  }
}
