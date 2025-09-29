"use client"

import { Suspense } from "react"
import { Layout } from "@/components/Layout"
import { ReportsOverviewShell } from "@/app/reports/reports-overview-shell"
import { ReportsFilters } from "@/app/reports/components/ReportsFilters"
import { Card, CardContent } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <ReportsFilters onApply={() => {}} />
        <Suspense fallback={<Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Cargando métricas…</CardContent></Card>}>
          <ReportsOverviewShell />
        </Suspense>
      </div>
    </Layout>
  )
}
