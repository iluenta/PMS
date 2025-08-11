"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { searchPeople } from '@/lib/peopleService'
import type { Person } from '@/types/people'

interface Props {
  value: { name: string; email?: string; phone?: string; personId?: string }
  onChange: (val: { name: string; email?: string; phone?: string; personId?: string }, picked?: Person) => void
}

export function GuestPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)

  function closePopover() {
    setOpen(false)
    // small timeout to avoid re-open due to focus bouncing
    setTimeout(() => inputRef.current?.blur(), 0)
  }

  function createFromTyped() {
    const typed = (value.name || query).trim()
    if (!typed) { closePopover(); return }
    onChange({ ...value, name: typed })
    closePopover()
  }

  // Debounce query
  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try { setResults(await searchPeople({ query: q, type: 'guest', limit: 10 })) } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={value.name}
          placeholder="Nombre completo"
          onChange={(e) => {
            onChange({ ...value, name: e.target.value, personId: value.personId })
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => { if (!value.name && !query) setOpen(true) }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); closePopover() }
            if (e.key === 'Enter') {
              const hasResults = results.length > 0
              if (!hasResults) { e.preventDefault(); createFromTyped() }
            }
            if (e.key === 'ArrowDown') {
              if (!open) setOpen(true)
            }
          }}
          onBlur={(e) => {
            const next = e.relatedTarget as HTMLElement | null
            const isWithinPopover = next?.closest('[role="dialog"]')
            if (!isWithinPopover) setOpen(false)
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[420px]" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre, email o teléfono…"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); closePopover() }
              if (e.key === 'Enter') {
                const hasResults = results.length > 0
                if (!hasResults) { e.preventDefault(); createFromTyped() }
              }
            }}
            // evitar que el CommandInput robe el foco al cerrar y reabra el popover
            onBlur={(e) => {
              const next = (e.relatedTarget as HTMLElement | null)
              const isInside = next?.closest('[role="dialog"]')
              if (!isInside) setOpen(false)
            }}
          />
          <CommandList>
            {loading && <div className="p-2 text-sm">Buscando…</div>}
            <CommandEmpty>
              <div className="p-2 text-sm space-y-1">
                <div>No hay resultados</div>
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={createFromTyped}
                >
                  Pulsar Enter para crear con lo escrito
                </button>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Coincidencias">
              {results.map((p) => (
                <CommandItem key={p.id} value={p.id} onSelect={() => { closePopover(); onChange({ name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(), email: p.email ?? '', phone: p.phone ?? '', personId: p.id }, p) }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.company_name || 'Sin nombre'}</span>
                      <span className="text-xs text-muted-foreground">{p.email || p.phone || p.country || ''}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Guest</Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Acciones">
              <CommandItem onSelect={createFromTyped} onMouseDown={(e) => e.preventDefault()}>Crear nueva persona con los datos escritos</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


