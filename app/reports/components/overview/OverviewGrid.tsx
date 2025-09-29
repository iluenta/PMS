import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewMetrics } from "@/lib/reports"
import { OverviewMetric } from "./OverviewMetric"
import { SummaryCard } from "./SummaryCard"

interface OverviewGridProps {
  data: OverviewMetrics
}

export function OverviewGrid({ data }: OverviewGridProps) {
  const { finances, operations, bookings, guests, comparative, trend, range } = data

  return (
    <div className="space-y-6">
      <SummaryCard range={range} finances={finances} operations={operations} />

      <Card>
        <CardHeader>
          <CardTitle>Finanzas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <OverviewMetric label="Ingresos totales" value={finances.totalRevenue} type="currency" />
          <OverviewMetric label="Pagos recibidos" value={finances.paymentsReceived} type="currency" />
          <OverviewMetric label="Pagos pendientes" value={finances.paymentsPending} type="currency" />
          <OverviewMetric label="Gastos" value={finances.expenses} type="currency" />
          <OverviewMetric label="Comisiones" value={finances.commissions} type="currency" />
          <OverviewMetric label="Beneficio neto" value={finances.netIncome} type="currency" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operaciones</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <OverviewMetric label="Ocupación" value={operations.occupancyRate} type="percentage" />
          <OverviewMetric label="Noches reservadas" value={operations.nightsBooked} />
          <OverviewMetric label="Noches disponibles" value={operations.nightsAvailable} />
          <OverviewMetric label="ADR" value={operations.adr} type="currency" />
          <OverviewMetric label="RevPAR" value={operations.revPar} type="currency" />
          <OverviewMetric label="Estancia media" value={operations.averageStay} suffix=" noches" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reservas por canal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {bookings.byChannel.map(item => (
            <OverviewMetric
              key={item.channel}
              label={`${item.channel}`}
              value={item.revenue}
              type="currency"
              helper={`${item.reservations} reservas`}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparativa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <OverviewMetric label="Reservas totales" value={bookings.total} />
          <OverviewMetric label="Cancelaciones" value={bookings.cancelled} />
          <OverviewMetric label="Tasa de cancelación" value={bookings.cancellationRate} type="percentage" />
          <OverviewMetric label="Clientes nuevos" value={guests.newGuests} />
          <OverviewMetric label="Clientes recurrentes" value={guests.returningGuests} />
          <OverviewMetric label="Tasa de repetición" value={guests.repeatRate} type="percentage" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos por mes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {trend.revenueByMonth.map(month => (
            <OverviewMetric
              key={month.label}
              label={month.label}
              value={month.revenue}
              type="currency"
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos por propiedad</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {comparative.revenueByProperty.map(item => (
            <OverviewMetric
              key={item.propertyId}
              label={item.propertyName}
              value={item.revenue}
              type="currency"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
