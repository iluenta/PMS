"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ReportsDateRange = {
  from: string
  to: string
}

export type ReportsFilterPreset = "this-year" | "last-year" | "last-30" | "custom"

const DEFAULT_DATE_RANGE: ReportsDateRange = {
  from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10)
}

const PRESET_RANGES: Record<ReportsFilterPreset, () => ReportsDateRange> = {
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
  custom: () => DEFAULT_DATE_RANGE
}

export interface ReportsFiltersValue {
  propertyId?: string
  channel?: string
  dateRange: ReportsDateRange
  preset?: ReportsFilterPreset
}

interface PropertyOption {
  id: string
  name: string
}

interface ChannelOption {
  value: string
  label: string
}

interface ReportsFiltersProps {
  propertyOptions?: PropertyOption[]
  channelOptions?: ChannelOption[]
  value?: ReportsFiltersValue
  onApply?: (filters: ReportsFiltersValue) => void
  onReset?: () => void
}

const DEFAULT_CHANNEL_OPTIONS: ChannelOption[] = [
  { value: "all", label: "Todos los canales" },
  { value: "airbnb", label: "Airbnb" },
  { value: "booking", label: "Booking.com" },
  { value: "vrbo", label: "VRBO" },
  { value: "direct", label: "Directo" }
]

export function ReportsFilters({
  propertyOptions = [],
  channelOptions = DEFAULT_CHANNEL_OPTIONS,
  value,
  onApply,
  onReset
}: ReportsFiltersProps) {
  const [propertyId, setPropertyId] = useState<string>(value?.propertyId ?? "all")
  const [channel, setChannel] = useState<string>(value?.channel ?? "all")
  const [preset, setPreset] = useState<ReportsFilterPreset>(value?.preset ?? "this-year")
  const [dateRange, setDateRange] = useState<ReportsDateRange>(value?.dateRange ?? PRESET_RANGES[preset]())

  useEffect(() => {
    if (!value) return
    setPropertyId(value.propertyId ?? "all")
    setChannel(value.channel ?? "all")
    const incomingPreset = value.preset ?? "custom"
    setPreset(incomingPreset)
    setDateRange(value.dateRange)
  }, [value?.propertyId, value?.channel, value?.dateRange?.from, value?.dateRange?.to, value?.preset])

  const summary = useMemo(() => `${dateRange.from} → ${dateRange.to}`, [dateRange])

  const handlePresetChange = (nextPreset: ReportsFilterPreset) => {
    setPreset(nextPreset)
    if (nextPreset !== "custom") {
      setDateRange(PRESET_RANGES[nextPreset]())
    }
  }

  const handleCustomChange = (field: keyof ReportsDateRange) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleApply = () => {
    const payload: ReportsFiltersValue = {
      propertyId: propertyId === "all" ? undefined : propertyId,
      channel: channel === "all" ? undefined : channel,
      dateRange,
      preset
    }
    onApply?.(payload)
  }

  const handleReset = () => {
    setPropertyId("all")
    setChannel("all")
    setPreset("this-year")
    const resetRange = PRESET_RANGES["this-year"]()
    setDateRange(resetRange)
    onReset?.()
    onApply?.({ propertyId: undefined, channel: undefined, dateRange: resetRange, preset: "this-year" })
  }

  const propertyItems = useMemo(() => {
    const baseOptions: PropertyOption[] = [{ id: "all", name: "Todas las propiedades" }]
    return [...baseOptions, ...propertyOptions]
  }, [propertyOptions])

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
                {propertyItems.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
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
                {channelOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset">Rango</Label>
            <Select value={preset} onValueChange={(value) => handlePresetChange(value as ReportsFilterPreset)}>
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
