"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { OverviewGrid } from "./components/overview/OverviewGrid"
import { useReportsOverview } from "@/hooks/useReportsOverview"

interface ReportsOverviewShellProps {
  tenantId?: number
  propertyId?: string
  dateFrom?: string
  dateTo?: string
  channel?: string
}

const DEFAULT_TENANT_ID = 1
const FALLBACK_DATE_FROM = new Date(new Date().getFullYear(), 0, 1)
const FALLBACK_DATE_TO = new Date()

function formatISO(date?: string, fallback?: Date) {
  if (date) return date
  if (!fallback) return new Date().toISOString().slice(0, 10)
  return fallback.toISOString().slice(0, 10)
}

export function ReportsOverviewShell({
  tenantId = DEFAULT_TENANT_ID,
  propertyId,
  dateFrom,
  dateTo,
  channel
}: ReportsOverviewShellProps) {
  const parameters = useMemo(() => ({
    tenantId,
    propertyId,
    channel,
    dateFrom: formatISO(dateFrom, FALLBACK_DATE_FROM),
    dateTo: formatISO(dateTo, FALLBACK_DATE_TO)
  }), [tenantId, propertyId, channel, dateFrom, dateTo])

  const { data, loading, error } = useReportsOverview({
    ...parameters,
    enabled: Boolean(tenantId)
  })

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
        <CardContent className="text-sm text-destructive">{error}</CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return <OverviewGrid data={data} />
}
