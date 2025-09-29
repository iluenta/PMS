import { useCallback, useEffect, useMemo, useState } from "react"
import type { OverviewFilters, OverviewMetrics } from "@/lib/reports"

interface UseReportsOverviewOptions {
  tenantId: number
  propertyId?: string
  channel?: string
  dateFrom: string
  dateTo: string
  enabled?: boolean
}

interface UseReportsOverviewResult {
  data: OverviewMetrics | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useReportsOverview(options: UseReportsOverviewOptions): UseReportsOverviewResult {
  const { tenantId, propertyId, channel, dateFrom, dateTo, enabled = true } = options

  const payload: OverviewFilters = useMemo(() => ({
    tenantId,
    propertyId,
    channel,
    dateFrom,
    dateTo
  }), [tenantId, propertyId, channel, dateFrom, dateTo])

  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) return

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
    if (!enabled) return

    const controller = new AbortController()
    fetchOverview(controller.signal)
    return () => controller.abort()
  }, [enabled, fetchOverview])

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
