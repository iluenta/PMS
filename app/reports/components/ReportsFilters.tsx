"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEFAULT_DATE_RANGE = {
  from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10)
}

const PRESET_RANGES: Record<string, () => { from: string; to: string }> = {
  "this-year": () => ({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  }),
  "last-year": () => ({
    from: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().slice(0, 10),
    to: new Date(new Date().getFullYear() - 1, 11, 31).toISOString().slice(0, 10)
  }),
  "last-30": () => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - 30)
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10)
    }
  },
  "custom": () => DEFAULT_DATE_RANGE
}

export function ReportsFilters() {
  const [propertyId, setPropertyId] = useState<string | undefined>()
  const [channel, setChannel] = useState<string | undefined>()
  const [preset, setPreset] = useState<string>("this-year")
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE)

  const summary = useMemo(() => {
    return `${dateRange.from} → ${dateRange.to}`
  }, [dateRange])

  const handlePresetChange = (value: string) => {
    setPreset(value)
    if (value !== "custom") {
      const range = PRESET_RANGES[value]()
      setDateRange(range)
    }
  }

  const handleCustomChange = (field: "from" | "to") => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleApply = () => {
    console.log("Applying filters", {
      propertyId,
      channel,
      dateRange
    })
    // TODO: integrate with data store / query params
  }

  const handleReset = () => {
    setPropertyId(undefined)
    setChannel(undefined)
    setPreset("this-year")
    setDateRange(PRESET_RANGES["this-year"]())
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="property">Propiedad</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger id="property">
                <SelectValue placeholder="Todas las propiedades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {/* TODO: populate with real properties */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Canal</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="channel">
                <SelectValue placeholder="Todos los canales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="booking">Booking.com</SelectItem>
                <SelectItem value="vrbo">VRBO</SelectItem>
                <SelectItem value="direct">Directo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset">Rango</Label>
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-year">Año actual</SelectItem>
                <SelectItem value="last-year">Año anterior</SelectItem>
                <SelectItem value="last-30">Últimos 30 días</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="from">Desde</Label>
                <Input id="from" type="date" value={dateRange.from} onChange={handleCustomChange("from")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Hasta</Label>
                <Input id="to" type="date" value={dateRange.to} onChange={handleCustomChange("to")} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground hidden md:block">{summary}</div>
          <Button variant="secondary" onClick={handleReset}>Restablecer</Button>
          <Button onClick={handleApply}>Aplicar filtros</Button>
        </div>
      </div>
    </Card>
  )
}
