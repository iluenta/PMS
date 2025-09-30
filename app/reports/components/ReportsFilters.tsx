"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProperty } from "@/contexts/PropertyContext"
import { getActivePropertyChannels } from "@/lib/channels"
import { getReservationTypes } from "@/lib/settings"

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
  reservationType?: string
  dateRange: ReportsDateRange
  preset?: ReportsFilterPreset
}

interface ChannelOption {
  value: string
  label: string
}

interface ReportsFiltersProps {
  value?: ReportsFiltersValue
  onApply?: (filters: ReportsFiltersValue) => void
  onReset?: () => void
  onChange?: (filters: ReportsFiltersValue) => void
}

const BASE_CHANNEL_OPTIONS: ChannelOption[] = [
  { value: "all", label: "Todos los canales" }
]

const DEFAULT_PRESET: ReportsFilterPreset = "this-year"

export function ReportsFilters({
  value,
  onApply,
  onReset,
  onChange
}: ReportsFiltersProps) {
  const { selectedProperty, properties } = useProperty()

  const [channelOptions, setChannelOptions] = useState<ChannelOption[]>(BASE_CHANNEL_OPTIONS)
  const [channel, setChannel] = useState<string>(value?.channel ?? "all")
  const [preset, setPreset] = useState<ReportsFilterPreset>(value?.preset ?? DEFAULT_PRESET)
  const [dateRange, setDateRange] = useState<ReportsDateRange>(value?.dateRange ?? PRESET_RANGES[preset]())
  const [scope, setScope] = useState<"current" | "all">(value?.propertyId === "all" ? "all" : "current")
  const [loadingChannels, setLoadingChannels] = useState(false)
  const reservationTypeOptions = [
    { value: "commercial", label: "Reservas comerciales" },
    { value: "owner_stay", label: "Uso propietario" },
    { value: "blocked", label: "Bloqueos" },
    { value: "all", label: "Todas (incluye usos internos)" }
  ]
  const [loadingReservationTypes, setLoadingReservationTypes] = useState(false)

  useEffect(() => {
    if (!value) return
    setChannel(value.channel ?? "all")
    const incomingPreset = value.preset ?? "custom"
    setPreset(incomingPreset)
    setDateRange(value.dateRange)
    setScope(value.propertyId === "all" ? "all" : "current")
  }, [value?.channel, value?.reservationType, value?.dateRange?.from, value?.dateRange?.to, value?.preset, value?.propertyId])

  useEffect(() => {
    const loadReservationTypes = async () => {
      setLoadingReservationTypes(true)
      try {
        const types = await getReservationTypes()
        setReservationTypes([
          { value: "commercial", label: "Reservas comerciales" },
          { value: "owner_stay", label: "Uso propietario" },
          { value: "blocked", label: "Bloqueos" }
        ].map(defaultType => {
          if (types.includes(defaultType.value)) {
            return defaultType
          }
          return defaultType
        }))
      } catch (error) {
        console.error("Error loading reservation types:", error)
      } finally {
        setLoadingReservationTypes(false)
      }
    }

    loadReservationTypes()
  }, [])

  useEffect(() => {
    const loadChannels = async () => {
      setLoadingChannels(true)
      const propertyIds = scope === "all"
        ? properties.map(property => property.id)
        : selectedProperty?.id
          ? [selectedProperty.id]
          : []

      if (propertyIds.length === 0) {
        setChannelOptions(BASE_CHANNEL_OPTIONS)
        setChannel("all")
        setLoadingChannels(false)
        return
      }

      try {
        const results = await Promise.all(propertyIds.map(id => getActivePropertyChannels(id)))
        const optionMap = new Map<string, ChannelOption>()

        results.flat().forEach(item => {
          const name = item.channel?.name?.trim()
          if (!name) return
          const key = name.toLowerCase()
          if (!optionMap.has(key)) {
            optionMap.set(key, { value: name, label: name })
          }
        })

        const mergedOptions = [
          BASE_CHANNEL_OPTIONS[0],
          ...Array.from(optionMap.values()).sort((a, b) => a.label.localeCompare(b.label, "es"))
        ]

        setChannelOptions(mergedOptions)

        if (!mergedOptions.some(option => option.value === channel)) {
          setChannel("all")
        }
      } catch (error) {
        console.error("Error loading report channels:", error)
        setChannelOptions(BASE_CHANNEL_OPTIONS)
        setChannel("all")
      } finally {
        setLoadingChannels(false)
      }
    }

    loadChannels()
  }, [properties, selectedProperty?.id, scope, channel])

  useEffect(() => {
    const computedPropertyId = scope === "all" ? "all" : selectedProperty?.id
    const current: ReportsFiltersValue = {
      propertyId: computedPropertyId,
      channel: channel === "all" ? undefined : channel,
      reservationType: "commercial", // Default to commercial for now, as the state was removed
      dateRange,
      preset
    }
    onChange?.(current)
  }, [scope, selectedProperty?.id, channel, dateRange, preset, onChange])

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
      propertyId: scope === "all" ? "all" : selectedProperty?.id,
      channel: channel === "all" ? undefined : channel,
      reservationType: "commercial", // Default to commercial for now, as the state was removed
      dateRange,
      preset
    }
    onApply?.(payload)
  }

  const handleReset = () => {
    setScope("current")
    setChannel("all")
    setPreset(DEFAULT_PRESET)
    const resetRange = PRESET_RANGES[DEFAULT_PRESET]()
    setDateRange(resetRange)
    onReset?.()
    onApply?.({ propertyId: selectedProperty?.id, channel: undefined, reservationType: "commercial", dateRange: resetRange, preset: DEFAULT_PRESET })
  }

  const showScopeSelector = properties.length > 1
  const selectedPropertyName = selectedProperty?.name ?? "Sin propiedad seleccionada"

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Propiedad</Label>
            {showScopeSelector ? (
              <Select value={scope} onValueChange={(value) => setScope(value as "current" | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    {selectedPropertyName}
                  </SelectItem>
                  <SelectItem value="all">Consolidado (todas)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground bg-muted/30">
                {selectedPropertyName}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Canal</Label>
            <Select value={channel} onValueChange={setChannel} disabled={loadingChannels || channelOptions.length <= 1}>
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

          <div className="space-y-2">
            <Label htmlFor="reservationType">Tipo de reserva</Label>
            <Select
              value="commercial" // Default to commercial for now, as the state was removed
              onValueChange={() => {}}
            >
              <SelectTrigger id="reservationType">
                <SelectValue placeholder="Reservas comerciales" />
              </SelectTrigger>
              <SelectContent>
                {reservationTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
