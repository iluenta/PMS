"use client"

import { useEffect, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { searchPeople, createPerson } from '@/lib/peopleService'
import type { Person } from '@/types/people'

interface Props {
  value: { name: string; email?: string; phone?: string; personId?: string }
  onChange: (val: { name: string; email?: string; phone?: string; personId?: string }, picked?: Person) => void
}

export function ProviderPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)

  function closePopover() {
    setOpen(false)
    // Limpiar la búsqueda al cerrar
    setQuery('')
  }

  async function createFromTyped() {
    const typed = (query.trim() || value.name).trim()
    if (!typed) { closePopover(); return }
    
    try {
      // Crear el proveedor en la base de datos
      const newPerson = await createPerson({
        first_name: typed,
        last_name: '',
        company_name: typed,
        email: '',
        phone: '',
        country: '',
        person_type: 'provider'
      })
      
      // Actualizar el valor con el nuevo proveedor creado
      onChange({ 
        ...value, 
        name: typed, 
        personId: newPerson.id 
      }, newPerson)
      
      closePopover()
    } catch (error) {
      console.error('Error creating provider:', error)
      // Si falla la creación, al menos actualizar el nombre
      onChange({ ...value, name: typed, personId: undefined })
      closePopover()
    }
  }

  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try { setResults(await searchPeople({ query: q, type: 'provider', limit: 10 })) } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  // Cerrar popover cuando se selecciona un proveedor
  useEffect(() => {
    if (value.personId && open) {
      closePopover()
    }
  }, [value.personId, open])

  // Cargar el proveedor existente si tenemos vendor_id pero no personId
  useEffect(() => {
    if (value.personId && !results.some(p => p.id === value.personId)) {
      // Si tenemos un personId pero no está en los resultados, buscar específicamente
      const loadExistingProvider = async () => {
        try {
          const results = await searchPeople({ query: value.name, type: 'provider', limit: 1 })
          if (results.length > 0) {
            setResults(results)
          }
        } catch (error) {
          console.error('Error loading existing provider:', error)
        }
      }
      loadExistingProvider()
    }
  }, [value.personId, value.name])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={value.name}
            placeholder="Nombre del proveedor"
            onChange={(e) => {
              onChange({ ...value, name: e.target.value, personId: undefined })
              setQuery(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { 
                e.preventDefault(); 
                closePopover() 
              }
              if (e.key === 'Enter') {
                e.preventDefault()
                if (results.length === 0) {
                  createFromTyped()
                }
              }
              if (e.key === 'ArrowDown') {
                if (!open) setOpen(true)
              }
            }}
          />
          {value.personId && (
            <button
              type="button"
              onClick={() => onChange({ ...value, name: '', personId: undefined })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Limpiar proveedor"
            >
              ✕
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[420px]" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar proveedor por nombre, email o teléfono…"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { 
                e.preventDefault(); 
                closePopover() 
              }
              if (e.key === 'Enter') {
                e.preventDefault()
                if (results.length === 0) {
                  createFromTyped()
                }
              }
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
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={createFromTyped}
                >
                  Crear nuevo proveedor con lo escrito
                </button>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Proveedores">
              {results.map((p) => (
                <CommandItem key={p.id} value={p.id} onSelect={() => { closePopover(); onChange({ name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.company_name || 'Sin nombre', email: p.email ?? '', phone: p.phone ?? '', personId: p.id }, p) }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{`${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.company_name || 'Sin nombre'}</span>
                      <span className="text-xs text-muted-foreground">{p.email || p.phone || p.country || ''}</span>
                    </div>
                    <Badge className="bg-violet-100 text-violet-800">Proveedor</Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Acciones">
              <CommandItem
                onSelect={createFromTyped}
                onMouseDown={(e) => e.preventDefault()}
              >
                Crear nuevo proveedor con los datos escritos
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


