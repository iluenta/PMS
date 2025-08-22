import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  ReservationStatusSelect, 
  ReservationStatusSelectSimple,
  ReservationStatusBadge,
  ReservationStatusColor 
} from '@/components/ui/reservation-status'

export function ReservationFormExample() {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Reserva - Ejemplo de Uso</CardTitle>
          <CardDescription>
            Este es un ejemplo de cómo usar los componentes de estado de reserva
            que se conectan automáticamente con la tabla settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select Avanzado con Popover */}
          <div className="space-y-2">
            <Label htmlFor="status-advanced">Estado de Reserva (Avanzado)</Label>
            <ReservationStatusSelect
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder="Seleccionar estado de la reserva..."
            />
          </div>

          {/* Select Simple para formularios básicos */}
          <div className="space-y-2">
            <Label htmlFor="status-simple">Estado de Reserva (Simple)</Label>
            <ReservationStatusSelectSimple
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder="Seleccionar estado..."
            />
          </div>

          {/* Botón para mostrar preview */}
          <Button 
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
          >
            {showPreview ? 'Ocultar' : 'Mostrar'} Preview
          </Button>

          {/* Preview del estado seleccionado */}
          {showPreview && selectedStatus && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium">Preview del Estado Seleccionado:</h4>
              
              {/* Badge con color */}
              <div className="space-y-2">
                <Label>Badge con Color:</Label>
                <ReservationStatusBadge statusName={selectedStatus} showIcon />
              </div>

              {/* Solo el color */}
              <div className="space-y-2">
                <Label>Indicador de Color:</Label>
                <ReservationStatusColor statusName={selectedStatus} className="w-6 h-6" />
              </div>

              {/* Información del estado */}
              <div className="space-y-2">
                <Label>Estado Seleccionado:</Label>
                <p className="text-sm text-gray-600">{selectedStatus}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información sobre la configuración */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo Funciona?</CardTitle>
          <CardDescription>
            Los componentes se conectan automáticamente con la tabla settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Configuración en Base de Datos</h4>
            <p className="text-sm text-gray-600">
              Los estados se almacenan en la tabla <code>settings</code> con la clave 
              <code>reservation_statuses</code> y tipo <code>colored_list</code>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Carga Automática</h4>
            <p className="text-sm text-gray-600">
              Los componentes usan el hook <code>useReservationStatuses</code> para 
              cargar automáticamente los estados desde la configuración
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Fallback Inteligente</h4>
            <p className="text-sm text-gray-600">
              Si no se puede cargar la configuración, se usan valores por defecto 
              para mantener la funcionalidad
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">4. Actualización en Tiempo Real</h4>
            <p className="text-sm text-gray-600">
              Cuando se modifica la configuración en la tabla settings, los cambios 
              se reflejan automáticamente en todos los componentes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
