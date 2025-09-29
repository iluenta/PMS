interface OverviewMetricProps {
  label: string
  value: number
  type?: "currency" | "percentage"
  prefix?: string
  suffix?: string
  helper?: string
}

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

export function OverviewMetric({ label, value, type, prefix, suffix, helper }: OverviewMetricProps) {
  const displayValue = (() => {
    if (type === "currency") {
      return currencyFormatter.format(value)
    }
    if (type === "percentage") {
      return `${value.toFixed(2)}%`
    }
    if (prefix || suffix) {
      return `${prefix ?? ""}${numberFormatter.format(value)}${suffix ?? ""}`
    }
    return numberFormatter.format(value)
  })()

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{displayValue}</div>
      {helper ? <div className="mt-1 text-xs text-muted-foreground">{helper}</div> : null}
    </div>
  )
}
