"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { OverviewGrid } from "./components/overview/OverviewGrid"
import { useReportsOverview } from "@/hooks/useReportsOverview"
import type { ReportsFiltersValue } from "@/app/reports/components/ReportsFilters"

interface ReportsOverviewShellProps {
  filters: ReportsFiltersValue
}

export function ReportsOverviewShell({ filters }: ReportsOverviewShellProps) {
  const { data, loading, error } = useReportsOverview({ filters, enabled: true })

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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de métricas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Selecciona un rango válido para ver datos.</CardContent>
      </Card>
    )
  }

  return <OverviewGrid data={data} />
}
