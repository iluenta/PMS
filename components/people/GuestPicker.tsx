"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { searchPeople } from '@/lib/peopleService'
import type { Person } from '@/types/people'

interface Props {
  value: { name: string; email?: string; phone?: string }
  onChange: (val: { name: string; email?: string; phone?: string }, picked?: Person) => void
}

export function GuestPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)

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
          onChange={(e) => { onChange({ ...value, name: e.target.value }); setQuery(e.target.value) }}
          onFocus={() => setOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[420px]" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar por nombre, email o teléfono…" value={query} onValueChange={setQuery} />
          <CommandList>
            {loading && <div className="p-2 text-sm">Buscando…</div>}
            <CommandEmpty>No hay resultados</CommandEmpty>
            <CommandGroup heading="Coincidencias">
              {results.map((p) => (
                <CommandItem key={p.id} value={p.id} onSelect={() => { setOpen(false); inputRef.current?.blur(); onChange({ name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(), email: p.email ?? '', phone: p.phone ?? '' }, p) }}>
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
              <CommandItem onSelect={() => { setOpen(false); inputRef.current?.blur() }}>Crear nueva persona con los datos escritos</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


