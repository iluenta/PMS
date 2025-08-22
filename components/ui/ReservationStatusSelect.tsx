import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useReservationStatuses } from '@/hooks/useReservationStatuses'
import { ReservationStatusColor } from './ReservationStatusBadge'

interface ReservationStatusSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ReservationStatusSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar estado...",
  className,
  disabled = false
}: ReservationStatusSelectProps) {
  const [open, setOpen] = useState(false)
  const { statuses, loading, error } = useReservationStatuses()

  const selectedStatus = statuses.find(status => status.name === value)

  if (loading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        disabled
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
          Cargando estados...
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  if (error) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        disabled
      >
        Error cargando estados
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedStatus ? (
            <div className="flex items-center gap-2">
              <ReservationStatusColor statusName={selectedStatus.name} />
              {selectedStatus.name}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar estado..." />
          <CommandList>
            <CommandEmpty>No se encontraron estados.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.name}
                  value={status.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ReservationStatusColor statusName={status.name} />
                    {status.name}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === status.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Componente Select simple para formularios
export function ReservationStatusSelectSimple({
  value,
  onValueChange,
  placeholder = "Seleccionar estado...",
  className,
  disabled = false
}: ReservationStatusSelectProps) {
  const { statuses, loading, error } = useReservationStatuses()

  if (loading) {
    return (
      <select 
        className={cn("w-full p-2 border rounded-md bg-gray-100", className)}
        disabled
      >
        <option>Cargando estados...</option>
      </select>
    )
  }

  if (error) {
    return (
      <select 
        className={cn("w-full p-2 border rounded-md bg-red-50", className)}
        disabled
      >
        <option>Error cargando estados</option>
      </select>
    )
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn("w-full p-2 border rounded-md", className)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {statuses.map((status) => (
        <option key={status.name} value={status.name}>
          {status.name}
        </option>
      ))}
    </select>
  )
}
