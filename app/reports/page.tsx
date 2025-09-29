"use client"

import { useMemo, useState } from "react"
import { Suspense } from "react"
import { Layout } from "@/components/Layout"
import { ReportsOverviewShell } from "@/app/reports/reports-overview-shell"
import { ReportsFilters, ReportsFiltersValue } from "@/app/reports/components/ReportsFilters"
import { Card, CardContent } from "@/components/ui/card"

const DEFAULT_FILTERS: ReportsFiltersValue = {
  propertyId: undefined,
  channel: undefined,
  preset: "this-year",
  dateRange: {
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  }
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportsFiltersValue>(DEFAULT_FILTERS)

  const overviewParams = useMemo(() => ({
    propertyId: filters.propertyId,
    channel: filters.channel,
    dateFrom: filters.dateRange.from,
    dateTo: filters.dateRange.to
  }), [filters])

  return (
    <Layout>
      <div className="space-y-6">
        <ReportsFilters value={filters} onChange={setFilters} onApply={setFilters} />
        <Suspense fallback={<Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Cargando métricas…</CardContent></Card>}>
          <ReportsOverviewShell {...overviewParams} />
        </Suspense>
      </div>
    </Layout>
  )
}
