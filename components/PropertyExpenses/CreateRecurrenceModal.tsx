'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Expense } from '@/lib/supabase'

interface CreateRecurrenceModalProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense | null
  onCreateRecurrence: (recurrenceData: RecurrenceData) => Promise<void>
}

interface RecurrenceData {
  isRecurring: boolean
  startDate: string
  endDate: string
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
}

export function CreateRecurrenceModal({ 
  isOpen, 
  onClose, 
  expense,
  onCreateRecurrence
}: CreateRecurrenceModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({
    isRecurring: true, // Siempre activado ahora
    startDate: '',
    endDate: '',
    frequency: 'monthly', // Cambiar a mensual por defecto
    interval: 1
  })

  // Resetear campos cuando se abre la modal
  useEffect(() => {
    if (isOpen) {
      setRecurrenceData({
        isRecurring: true,
        startDate: '',
        endDate: '',
        frequency: 'monthly',
        interval: 1
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recurrenceData.startDate) {
      toast({ title: "Error", description: "La fecha de inicio es obligatoria", variant: "destructive" })
      return
    }

    if (!recurrenceData.endDate) {
      toast({ title: "Error", description: "La fecha de fin es obligatoria", variant: "destructive" })
      return
    }

    if (new Date(recurrenceData.startDate) >= new Date(recurrenceData.endDate)) {
      toast({ title: "Error", description: "La fecha de inicio debe ser anterior a la fecha de fin", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      await onCreateRecurrence(recurrenceData)
      toast({
        title: "Recurrencia creada",
        description: "Se han generado los gastos recurrentes correctamente"
      })
      onClose()
    } catch (error) {
      console.error('Error creating recurrence:', error)
      console.error('Full error object:', error)
      
      let errorMessage = "Error al crear la recurrencia"
      if (error instanceof Error && error.message) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as any
        if (errorObj.message) errorMessage = errorObj.message
        else if (errorObj.details) errorMessage = errorObj.details
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  // No validar fecha mínima - el usuario puede elegir cualquier fecha
  const getMinStartDate = () => {
    return '' // Sin restricción de fecha mínima
  }

  // Calcular fecha mínima para fin (día siguiente a la fecha de inicio)
  const getMinEndDate = () => {
    if (!recurrenceData.startDate) return ''
    const nextDay = new Date(recurrenceData.startDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return nextDay.toISOString().split('T')[0]
  }

  if (!expense) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            Recurrencia
          </DialogTitle>
          <DialogDescription>
            Configura la recurrencia para el gasto "{expense.description}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuración de recurrencia - Mostrar siempre */}
          <div className="space-y-4">
              {/* Fecha de inicio */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={recurrenceData.startDate}
                  onChange={(e) => setRecurrenceData({ ...recurrenceData, startDate: e.target.value })}
                  min={getMinStartDate()}
                  required
                />
                <p className="text-xs text-gray-500">
                  Elige la fecha desde la que quieres que comiencen los gastos recurrentes
                </p>
              </div>

              {/* Fecha fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin <span className="text-red-500">*</span></Label>
                <Input
                  id="endDate"
                  type="date"
                  value={recurrenceData.endDate}
                  onChange={(e) => setRecurrenceData({ ...recurrenceData, endDate: e.target.value })}
                  min={getMinEndDate()}
                  required
                />
              </div>

              {/* Frecuencia */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select 
                  value={recurrenceData.frequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setRecurrenceData({ ...recurrenceData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Intervalo */}
              <div className="space-y-2">
                <Label htmlFor="interval">Cada</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="12"
                    value={recurrenceData.interval}
                    onChange={(e) => setRecurrenceData({ ...recurrenceData, interval: parseInt(e.target.value) || 1 })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">
                    {recurrenceData.frequency === 'daily' && 'día(s)'}
                    {recurrenceData.frequency === 'weekly' && 'semana(s)'}
                    {recurrenceData.frequency === 'monthly' && 'mes(es)'}
                  </span>
                </div>
              </div>

              {/* Información adicional */}
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <p>Se generarán gastos automáticamente desde <strong>{recurrenceData.startDate ? new Date(recurrenceData.startDate).toLocaleDateString('es-ES') : 'la fecha seleccionada'}</strong> hasta <strong>{recurrenceData.endDate ? new Date(recurrenceData.endDate).toLocaleDateString('es-ES') : 'la fecha seleccionada'}</strong></p>
                <p className="mt-1">Frecuencia: <strong>{recurrenceData.frequency === 'daily' ? 'Diario' : recurrenceData.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</strong> cada <strong>{recurrenceData.interval}</strong> {recurrenceData.frequency === 'daily' ? 'día(s)' : recurrenceData.frequency === 'weekly' ? 'semana(s)' : 'mes(es)'}</p>
                <p className="mt-1">Todos los gastos generados tendrán estado "Pendiente" y se marcarán como recurrentes</p>
              </div>
            </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Creando..." : "Crear Recurrencia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
