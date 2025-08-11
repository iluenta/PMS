"use client"

import { useEffect, useRef, useState } from 'react'
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

export function ChannelPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [bootstrapped, setBootstrapped] = useState(false)

  function closePopover() {
    setOpen(false)
    setTimeout(() => inputRef.current?.blur(), 0)
  }

  function createFromTyped() {
    const typed = (query.trim() || value.name).trim()
    if (!typed) { closePopover(); return }
    onChange({ ...value, name: typed, personId: undefined })
    closePopover()
  }

  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try { setResults(await searchPeople({ query: q, type: 'distribution_channel', limit: 10 })) } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  // If a personId is provided but no name, fetch it once to bootstrap the visible value
  useEffect(() => {
    ;(async () => {
      if (!bootstrapped && value.personId && !value.name) {
        try {
          const { getPerson } = await import('@/lib/peopleService')
          const p = await getPerson(value.personId)
          if (p) {
            const name = p.company_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
            if (name) onChange({ ...value, name, personId: value.personId })
          }
        } catch {}
        setBootstrapped(true)
      }
    })()
  }, [value.personId, value.name, bootstrapped])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={value.name}
          placeholder="Nombre del canal (People)"
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
              if (!open) setOpen(true)
            }
            if (e.key === 'ArrowDown') if (!open) setOpen(true)
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
            placeholder="Buscar canal por nombre…"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); closePopover() }
              if (e.key === 'Enter') {
                const hasResults = results.length > 0
                if (!hasResults) { e.preventDefault(); createFromTyped() }
              }
            }}
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
                <button type="button" className="text-blue-600 hover:underline" onMouseDown={(e) => e.preventDefault()} onClick={createFromTyped}>
                  Crear nuevo canal con lo escrito
                </button>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Canales (People)">
              {results.map((p) => (
                <CommandItem key={p.id} value={p.id} onSelect={() => { closePopover(); onChange({ name: p.company_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(), personId: p.id }, p) }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{p.company_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Sin nombre'}</span>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800">Canal</Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Acciones">
              <CommandItem onSelect={createFromTyped} onMouseDown={(e) => e.preventDefault()}>
                Crear nuevo canal con los datos escritos
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


