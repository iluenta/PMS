import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewMetrics } from "@/lib/reports"
import { OverviewMetric } from "./OverviewMetric"

interface SummaryCardProps {
  range: OverviewMetrics["range"]
  finances: OverviewMetrics["finances"]
  operations: OverviewMetrics["operations"]
}

export function SummaryCard({ range, finances, operations }: SummaryCardProps) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Resumen general</CardTitle>
          <p className="text-sm text-muted-foreground">
            Periodo: {range.from} → {range.to} · {range.days} días
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="font-semibold text-primary">ADR:</span> {formatCurrency(operations.adr)}
          </div>
          <div>
            <span className="font-semibold text-primary">RevPAR:</span> {formatCurrency(operations.revPar)}
          </div>
          <div>
            <span className="font-semibold text-primary">Ocupación:</span> {operations.occupancyRate.toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <OverviewMetric label="Ingresos" value={finances.totalRevenue} type="currency" />
        <OverviewMetric label="Beneficio neto" value={finances.netIncome} type="currency" />
        <OverviewMetric label="Gastos" value={finances.expenses} type="currency" />
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}
