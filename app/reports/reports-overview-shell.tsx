"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { OverviewMetrics } from "@/lib/reports"

interface ReportsOverviewShellProps {
  tenantId?: number
  propertyId?: string
  dateFrom?: string
  dateTo?: string
  channel?: string
}

const DEFAULT_TENANT_ID = 1

export function ReportsOverviewShell({
  tenantId = DEFAULT_TENANT_ID,
  propertyId,
  dateFrom,
  dateTo,
  channel
}: ReportsOverviewShellProps) {
  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/reports/overview", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tenantId,
            propertyId,
            dateFrom,
            dateTo,
            channel
          })
        })

        if (!response.ok) {
          throw new Error(`Error fetching report (${response.status})`)
        }

        const payload = await response.json()
        setData(payload)
      } catch (err) {
        if ((err as any)?.name === "AbortError") return
        console.error("Error loading report overview", err)
        setError("No se pudo cargar el resumen. Intenta nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [tenantId, propertyId, dateFrom, dateTo, channel])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de métricas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de métricas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-500">{error}</CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { finances, operations, bookings } = data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de métricas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Ingresos totales" value={finances.totalRevenue} prefix="€" />
        <MetricCard label="Gastos" value={finances.expenses} prefix="€" />
        <MetricCard label="Beneficio neto" value={finances.netIncome} prefix="€" />
        <MetricCard label="Ocupación" value={operations.occupancyRate} suffix="%" />
        <MetricCard label="Reservas" value={bookings.total} />
        <MetricCard label="Cancelaciones" value={bookings.cancellationRate} suffix="%" />
      </CardContent>
    </Card>
  )
}

function MetricCard({ label, value, prefix, suffix }: { label: string; value: number; prefix?: string; suffix?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold">
        {prefix}{value.toLocaleString("es-ES", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}{suffix}
      </div>
    </div>
  )
}
